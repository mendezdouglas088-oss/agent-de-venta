import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import {
  WhatsappProvider,
  SendResultInterface,
  WhatsappConnectionStatus,
  WhatsappGroupInterface,
  WhatsappContact,
  WhatsappChatSummary,
  WhatsappMessageType,
  WhatsappMediaPayload,
} from '../domain/whatsapp-provider.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

import * as fs from 'fs/promises';
import * as path from 'path';

interface UserSession {
  client: Client | null;
  status: WhatsappConnectionStatus;
  lastQrString: string | null;
}

@Injectable()
export class WhatsappWebProvider
  implements WhatsappProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WhatsappWebProvider.name);
  private readonly sessions = new Map<string, UserSession>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    this.logger.log('Sesiones de WhatsApp se crean bajo demanda');
  }

  async onModuleDestroy() {
    for (const session of this.sessions.values()) {
      try {
        await session.client?.destroy();
      } catch {
        /* noop */
      }
    }
  }

  // ── contrato público ────────────────────────────────────────
  async connect(sessionId: string): Promise<void> {
    let session = this.sessions.get(sessionId);
    if (
      session &&
      ['connecting', 'waiting_qr', 'connected'].includes(session.status)
    )
      return;
    if (!session) session = this.createSession(sessionId);

    session.status = 'connecting';
    try {
      await session.client?.destroy();
    } catch {
      /* noop */
    }
    await this.initClientForUser(sessionId);
  }

  async getQr(sessionId: string): Promise<Buffer | null> {
    const session = this.sessions.get(sessionId);
    if (session?.status !== 'waiting_qr' || !session.lastQrString) return null;
    return QRCode.toBuffer(session.lastQrString, { type: 'png', scale: 8 });
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session?.client) {
      try {
        await session.client.destroy(); // solo cierra Chromium, no toca archivos ni la cuenta en el server de WA
      } catch (e) {
        this.logger.warn(
          `Error al destruir cliente ${sessionId}: ${e.message}`,
        );
      }
    }
    this.sessions.delete(sessionId);

    const sessionDir = path.join(
      process.cwd(),
      '.wwebjs_auth',
      `session-${sessionId}`,
    );
    try {
      // maxRetries/retryDelay es soporte nativo de Node para justo este caso (EBUSY/EPERM en Windows)
      await fs.rm(sessionDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 500,
      });
    } catch (e) {
      this.logger.warn(
        `No se pudo borrar la sesión ${sessionId}, seguirá logueada en WhatsApp: ${e.message}`,
      );
    }
  }

  getStatus(sessionId: string): WhatsappConnectionStatus {
    return this.sessions.get(sessionId)?.status ?? 'disconnected';
  }

  isConnected(sessionId: string): boolean {
    return this.getStatus(sessionId) === 'connected';
  }

  async sendText(
    connectionId: string,
    chatId: string,
    text: string,
  ): Promise<SendResultInterface> {
    const client = this.getClient(connectionId);
    if (!client) return { ok: false, error: 'WhatsApp no está conectado' };
    try {
      let targetId = chatId;
      if (chatId.endsWith('@lid')) {
        try {
          const contact = await client.getContactById(chatId);
          if (contact?.id?._serialized) targetId = contact.id._serialized;
        } catch (resolveErr) {
          console.log(
            'No se pudo resolver @lid, se usa el original:',
            resolveErr.message,
          );
        }
      }
      const msg = await client.sendMessage(targetId, text);
      await this.persistOutgoing(connectionId, msg);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async sendImages(
    sessionId: string,
    groupId: string,
    imageUrls: string[],
    caption?: string,
  ): Promise<SendResultInterface> {
    const client = this.getClient(sessionId);
    if (!client) return { ok: false, error: 'WhatsApp no está conectado' };
    const urls = (imageUrls || []).filter((u) => u?.trim());
    if (!urls.length) return { ok: false, error: 'No hay imágenes válidas' };

    for (const [i, url] of urls.entries()) {
      const media = await this.loadMedia(url);
      const options = i === 0 && caption ? { caption } : {};
      const msg = await client.sendMessage(groupId, media, options);
      await this.persistOutgoing(sessionId, msg); // ← nuevo
    }
    return { ok: true };
  }

  async getChats(sessionId: string): Promise<WhatsappChatSummary[]> {
    return (await this.getAllChats(sessionId)).filter((c) => !c.isGroup);
  }

  async getGroups(sessionId: string): Promise<WhatsappGroupInterface[]> {
    const all = await this.getAllChats(sessionId);
    return all
      .filter((c) => c.isGroup)
      .map((c) => ({
        whatsappGroupId: c.chatId,
        title: c.name,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c.unreadCount,
        participantsCount: c.participantsCount,
      }));
  }

  // ── privado: nada de esto sale del módulo ──────────────────
  getClient(sessionId: string): Client | null {
    const session = this.sessions.get(sessionId);
    return session?.status === 'connected' ? session.client : null;
  }

  private normalizeGroupId(groupId: string): string {
    return groupId.includes('@') ? groupId : `${groupId}@g.us`;
  }

  private createSession(sessionId: string): UserSession {
    const session: UserSession = {
      client: null,
      status: 'disconnected',
      lastQrString: null,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  private async loadMedia(url: string) {
    const isLocal = !url.startsWith('http://') && !url.startsWith('https://');
    return isLocal
      ? MessageMedia.fromFilePath(url)
      : MessageMedia.fromUrl(url, { unsafeMime: true });
  }

  private async initClientForUser(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)!;
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: sessionId }),
      puppeteer: {
        headless: false,
        protocolTimeout: 300000, // 5 min, en vez del default 180s
        args: [
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });
    session.client = client;

    client.on('qr', async (qr) => {
      this.logger.log(`[${sessionId}] QR RECEIVED`);
      session.status = 'waiting_qr';
      session.lastQrString = qr;
      this.logger.log(
        `QR generado para ${sessionId} (escanea en WhatsApp Web)`,
      );
      const qrImage = await QRCode.toDataURL(qr);
      this.logger.log(`QR generado para ${sessionId}`);
      this.eventEmitter.emit('whatsapp.qr', {
        connectionId: sessionId,
        qr: qrImage,
      });
    });

    client.on('ready', () => {
      session.status = 'connected';
      session.lastQrString = null;
      this.eventEmitter.emit('whatsapp.status', {
        connectionId: sessionId,
        status: 'connected',
      });
    });

    client.on('authenticated', () => {
      this.logger.log(`[${sessionId}] AUTHENTICATED`);
    });

    client.on('disconnected', async (reason) => {
      this.logger.warn(`[${sessionId}] DISCONNECTED: ${reason}`);
      session.status = 'disconnected';
      this.eventEmitter.emit('whatsapp.status', {
        connectionId: sessionId,
        status: 'disconnected',
      });
    });

    client.on('auth_failure', (message) => {
      console.log('AUTH FAILURE', message);
      this.logger.error(`[${sessionId}] AUTH FAILURE: ${message}`);
      session.status = 'auth_failed';
      this.eventEmitter.emit('whatsapp.status', {
        connectionId: sessionId,
        status: 'auth_failed',
      });
    });

    client.on('call', async (call) => {
      this.eventEmitter.emit('whatsapp.call', {
        sessionId,
        from: call.from,
        isVideo: call.isVideo,
        isGroup: call.isGroup,
        timestamp: call.timestamp,
      });
    });

    client.on('message', async (msg) => {
      const chat = await msg.getChat();
      const isGroup = chat.isGroup;
      const meId = client.info?.wid?._serialized;
      const myNumber = client.info?.wid?.user;
      const mentionedIds = msg.mentionedIds ?? [];

      let mentionsMe = false;
      for (const id of mentionedIds) {
        if (id === meId) {
          mentionsMe = true;
          break;
        }
        if (id.endsWith('@lid')) {
          try {
            const contact = await client.getContactById(id);
            if (contact?.number === myNumber) {
              mentionsMe = true;
              break;
            }
          } catch {
            // no se pudo resolver el lid, seguimos
          }
        }
      }

      let author: string | undefined;
      let authorName: string | undefined;
      if (isGroup && !msg.fromMe) {
        const contact = await msg.getContact();
        author = contact.id._serialized;
        authorName = contact.pushname || contact.number;
      }

      this.eventEmitter.emit('whatsapp.message.persist', {
        sessionId,
        chatId: chat.id._serialized,
        chatName: chat.name || chat.id.user,
        messageId: msg.id.id,
        fromMe: msg.fromMe,
        body: msg.body,
        timestamp: msg.timestamp,
        ack: msg.ack,
        unreadCount: chat.unreadCount,
        isGroup,
        type: this.mapMessageType(msg.type),
        serializedId: msg.id._serialized,
        hasMedia: msg.hasMedia,
        author,
        authorName,
        mentionsMe,
      });

      if (msg.fromMe) return;

      const contact = await msg.getContact();
      this.eventEmitter.emit('whatsapp.message.received', {
        sessionId,
        chatId: msg.from,
        isGroup,
        contact: {
          chatId: contact.id._serialized,
          name: contact.pushname || contact.number,
          phoneNumber: contact.number,
        },
        text: msg.body,
        messageId: msg.id.id,
        serializedId: msg.id._serialized,
        type: this.mapMessageType(msg.type),
        hasMedia: msg.hasMedia,
      });
    });

    try {
      await client.initialize();
    } catch (e) {
      console.log('ERROR', e);
      session.status = 'error';
      this.eventEmitter.emit('whatsapp.status', {
        connectionId: sessionId,
        status: 'error',
      });
      this.logger.error(
        `Error al inicializar WhatsApp para ${sessionId}`,
        e.message,
      );
    }
  }

  private mapMessageType(waType: string): WhatsappMessageType {
    const known = [
      'chat',
      'image',
      'video',
      'audio',
      'ptt',
      'document',
      'sticker',
      'call_log',
      'location',
      'vcard',
    ];
    return known.includes(waType) ? (waType as WhatsappMessageType) : 'unknown';
  }

  // ========================PUBLIC METHODS========================
  getAllConnectedSessionIds(): string[] {
    const result: string[] = [];
    this.sessions.forEach((session, id) => {
      if (session.status === 'connected') result.push(id);
    });
    return result;
  }

  async getAllChats(sessionId: string): Promise<WhatsappChatSummary[]> {
    const client = this.getClient(sessionId);
    if (!client) throw new Error('WhatsApp no está conectado');

    const state = await client.getState().catch(() => null);
    if (state !== 'CONNECTED') {
      throw new Error(
        `WhatsApp no está listo (estado: ${state ?? 'desconocido'})`,
      );
    }

    try {
      // Una sola llamada para chats y una sola para contactos, en paralelo
      const [chats, contacts] = await Promise.all([
        client.getChats(),
        client.getContacts(),
      ]);

      // Mapa id -> isMyContact, evita N llamadas a getContact()
      const contactMap = new Map<string, boolean>();
      for (const contact of contacts) {
        contactMap.set(contact.id._serialized, contact.isMyContact);
      }

      const summaries: WhatsappChatSummary[] = chats.map((c) => ({
        chatId: c.id._serialized,
        name: c.name || c.id.user,
        isGroup: c.isGroup,
        lastMessage: c.lastMessage?.body,
        lastMessageAt: c.lastMessage?.timestamp,
        unreadCount: c.unreadCount,
        participantsCount: c.isGroup
          ? (c as any).participants?.length
          : undefined,
        isSavedContact: c.isGroup
          ? undefined
          : contactMap.get(c.id._serialized),
      }));

      return summaries;
    } catch (err) {
      console.log('getAllChats error', err);
      this.logger.error(
        `getAllChats falló para ${sessionId}: ${err?.message || err}`,
      );
      throw new Error(
        'No se pudieron obtener los chats de WhatsApp, intenta de nuevo',
      );
    }
  }

  async getContact(
    sessionId: string,
    chatId: string,
  ): Promise<WhatsappContact> {
    const client = this.getClient(sessionId);
    if (!client) throw new Error('WhatsApp no está conectado');
    const contact = await client.getContactById(chatId);
    return {
      chatId: contact.id._serialized,
      name: contact.pushname || contact.number,
      phoneNumber: contact.number,
    };
  }

  async sendMedia(
    sessionId: string,
    chatId: string,
    media: WhatsappMediaPayload,
    options: { caption?: string; sendAudioAsVoice?: boolean } = {},
  ): Promise<SendResultInterface> {
    const client = this.getClient(sessionId);
    if (!client) return { ok: false, error: 'WhatsApp no está conectado' };
    try {
      const messageMedia = new MessageMedia(
        media.mimetype,
        media.data,
        media.filename,
      );
      const msg = await client.sendMessage(chatId, messageMedia, {
        caption: options.caption,
        sendAudioAsVoice:
          options.sendAudioAsVoice ?? media.mimetype.startsWith('audio/'),
      });
      await this.persistOutgoing(sessionId, msg); // ← nuevo
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async getMedia(
    sessionId: string,
    messageId: string, // debe ser el serializedId, no el messageId corto
  ): Promise<WhatsappMediaPayload | null> {
    const client = this.getClient(sessionId);
    if (!client) return null;
    try {
      const msg = await client.getMessageById(messageId);
      if (!msg?.hasMedia) return null;
      const media = await msg.downloadMedia();
      if (!media) return null;
      return {
        mimetype: media.mimetype,
        data: media.data,
        filename: media.filename,
      };
    } catch (e) {
      this.logger.warn(`getMedia falló para ${messageId}: ${e.message}`);
      return null;
    }
  }

  private async persistOutgoing(sessionId: string, msg: Message) {
    try {
      const chat = await msg.getChat();
      this.eventEmitter.emit('whatsapp.message.persist', {
        sessionId,
        chatId: chat.id._serialized,
        chatName: chat.name || chat.id.user,
        messageId: msg.id.id,
        serializedId: msg.id._serialized,
        fromMe: true,
        body: msg.body,
        timestamp: msg.timestamp,
        ack: msg.ack,
        unreadCount: chat.unreadCount,
        isGroup: chat.isGroup,
        type: this.mapMessageType(msg.type),
        hasMedia: msg.hasMedia,
        author: undefined,
        authorName: undefined,
        mentionsMe: false,
      });
    } catch (e) {
      this.logger.warn(`No se pudo persistir mensaje saliente: ${e.message}`);
    }
  }
}
