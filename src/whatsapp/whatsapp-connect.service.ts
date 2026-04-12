import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';

interface UserSession {
  client: Client;
  status: 'disconnected' | 'waiting_qr' | 'connected' | 'auth_failed' | 'error';
  lastQrString: string | null;
  qrPhotoCallback: ((buf: Buffer) => Promise<void>) | null;
  onReadyCallback: (() => Promise<void>) | null;
}

/**
 * Servicio de conexión a WhatsApp con sesiones INDEPENDIENTES por usuario.
 * Cada usuario tiene su propio cliente WhatsApp identificado por su telegramId.
 * Las sesiones se persisten en disco via LocalAuth({ clientId: telegramId }).
 */
@Injectable()
export class WhatsappConnectService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappConnectService.name);

  /** Mapa de sesiones activas: telegramId → UserSession */
  private readonly sessions = new Map<string, UserSession>();

  async onModuleInit() {
    // Las sesiones se inicializan bajo demanda (cuando el usuario presiona Connect)
    // No inicializamos nada al arrancar para no bloquear el arranque
    this.logger.log(
      'WhatsappConnectService listo — sesiones se crean bajo demanda',
    );
  }

  // ─── Helpers internos ────────────────────────────────────────────────────

  private getSession(telegramId: string): UserSession | undefined {
    return this.sessions.get(telegramId);
  }

  private createSession(telegramId: string): UserSession {
    const session: UserSession = {
      client: null as any,
      status: 'disconnected',
      lastQrString: null,
      qrPhotoCallback: null,
      onReadyCallback: null,
    };
    this.sessions.set(telegramId, session);
    return session;
  }

  // ─── Inicialización de cliente por usuario ───────────────────────────────

  private async initClientForUser(telegramId: string): Promise<void> {
    let session = this.getSession(telegramId);
    if (!session) session = this.createSession(telegramId);

    try {
      // Cada usuario tiene su propia carpeta de sesión en disco
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: telegramId }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      });

      session.client = client;

      client.on('qr', async (qr) => {
        session.status = 'waiting_qr';
        session.lastQrString = qr;
        if (session.qrPhotoCallback) {
          try {
            const buf = await QRCode.toBuffer(qr, { type: 'png', scale: 8 });
            await session.qrPhotoCallback(buf);
          } catch (e) {
            this.logger.error(
              `Error enviando QR al usuario ${telegramId}:`,
              e.message,
            );
          }
        }
      });

      client.on('ready', async () => {
        session.status = 'connected';
        session.lastQrString = null;
        this.logger.log(`✅ WhatsApp conectado para usuario ${telegramId}`);
        if (session.onReadyCallback) {
          try {
            await session.onReadyCallback();
          } catch (e) {
            this.logger.error(`Error en onReadyCallback para ${telegramId}:`, e.message);
          }
          session.onReadyCallback = null;
        }
      });

      client.on('disconnected', () => {
        session.status = 'disconnected';
        this.logger.warn(`⚠️ WhatsApp desconectado para usuario ${telegramId}`);
      });

      client.on('auth_failure', () => {
        session.status = 'auth_failed';
        this.logger.error(`❌ Auth fallida para usuario ${telegramId}`);
      });

      await client.initialize();
    } catch (error) {
      session.status = 'error';
      this.logger.error(
        `Error al inicializar WhatsApp para ${telegramId}:`,
        error.message,
      );
    }
  }

  // ─── API pública ─────────────────────────────────────────────────────────

  /**
   * Inicia la conexión WhatsApp para un usuario y registra el callback del QR.
   * Si ya hay sesión conectada, no hace nada.
   * Si ya hay QR esperando, lo envía inmediatamente.
   */
  async triggerQrSend(
    telegramId: string,
    sendPhoto: (buf: Buffer) => Promise<void>,
    onReady?: () => Promise<void>,
  ): Promise<void> {
    let session = this.getSession(telegramId);

    if (session?.status === 'connected') return;

    if (!session) session = this.createSession(telegramId);
    session.qrPhotoCallback = sendPhoto;
    if (onReady) session.onReadyCallback = onReady;

    // Si ya hay QR esperando, enviar ahora mismo
    if (session.status === 'waiting_qr' && session.lastQrString) {
      const buf = await QRCode.toBuffer(session.lastQrString, {
        type: 'png',
        scale: 8,
      });
      await sendPhoto(buf);
      return;
    }

    // Inicializar (o reinicializar) el cliente
    if (
      session.status === 'disconnected' ||
      session.status === 'error' ||
      session.status === 'auth_failed'
    ) {
      try {
        await session.client?.destroy();
      } catch (_) {}
      await this.initClientForUser(telegramId);
    }
  }

  /** Cancela el envío de QR para un usuario (cuando presiona Atrás) */
  cancelQr(telegramId: string): void {
    const session = this.getSession(telegramId);
    if (session) session.qrPhotoCallback = null;
  }

  /** Indica si el usuario tiene WhatsApp conectado */
  isConnected(telegramId: string): boolean {
    return this.getSession(telegramId)?.status === 'connected';
  }

  /** Retorna todos los telegramIds con sesión activa (conectada) */
  getAllConnectedTelegramIds(): string[] {
    const result: string[] = [];
    this.sessions.forEach((session, telegramId) => {
      if (session.status === 'connected') result.push(telegramId);
    });
    return result;
  }

  /** Estado de la sesión de un usuario */
  getStatus(telegramId: string): string {
    return this.getSession(telegramId)?.status ?? 'disconnected';
  }

  /** Cliente WhatsApp de un usuario (para enviar mensajes) */
  getClient(telegramId: string): Client | null {
    const session = this.getSession(telegramId);
    if (session?.status === 'connected') return session.client;
    return null;
  }

  // ─── Operaciones de mensajería ───────────────────────────────────────────

  async getGroups(telegramId: string) {
    const client = this.getClient(telegramId);
    if (!client)
      return {
        error: 'WhatsApp no está conectado',
        status: this.getStatus(telegramId),
      };
    const chats = await client.getChats();
    return chats
      .filter((chat) => chat.isGroup)
      .map((chat) => ({ id: chat.id._serialized, name: chat.name }));
  }

  async sendMessageToGroup(
    telegramId: string,
    groupNumber: string,
    message: string,
  ) {
    const client = this.getClient(telegramId);
    if (!client)
      return {
        error: 'WhatsApp no está conectado',
        status: this.getStatus(telegramId),
      };
    const groupId = groupNumber.includes('@')
      ? groupNumber
      : `${groupNumber}@g.us`;
    await client.sendMessage(groupId, message);
    return { success: true, groupId, message };
  }

  async sendImageToGroup(
    telegramId: string,
    groupNumber: string,
    imageUrls: string[],
    caption?: string,
  ) {
    const client = this.getClient(telegramId);
    if (!client)
      return {
        error: 'WhatsApp no está conectado',
        status: this.getStatus(telegramId),
      };

    const validUrls = (imageUrls || []).filter(
      (url) => url && url.trim().length > 0,
    );
    if (validUrls.length === 0)
      return { error: 'No hay imágenes válidas', imageUrls: [] };

    const groupId = groupNumber.includes('@')
      ? groupNumber
      : `${groupNumber}@g.us`;
    const sentUrls: string[] = [];
    const failedUrls: { url: string; error: string }[] = [];

    for (const [index, imageUrl] of validUrls.entries()) {
      try {
        const media = await this._loadMedia(imageUrl);
        const options = index === 0 && caption ? { caption } : {};
        await client.sendMessage(groupId, media, options);
        sentUrls.push(imageUrl);
      } catch (error) {
        failedUrls.push({
          url: imageUrl,
          error: error instanceof Error ? error.message : 'Error',
        });
      }
    }

    return {
      success: failedUrls.length === 0,
      groupId,
      sentCount: sentUrls.length,
      totalCount: validUrls.length,
      sentUrls,
      failedUrls: failedUrls.length > 0 ? failedUrls : undefined,
    };
  }

  private async _loadMedia(imageUrl: string): Promise<MessageMedia> {
    const isLocal =
      !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://');
    if (isLocal) return MessageMedia.fromFilePath(imageUrl);
    return MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
  }
}
