// src/whatsapp/infrastructure/whatsapp-web.provider.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import {
  WhatsappProvider,
  SendResultInterface,
  WhatsappConnectionStatus,
  WhatsappGroupInterface,
  WhatsappContact,
} from '../domain/whatsapp-provider.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  constructor(readonly eventEmitter: EventEmitter2) {} // EventEmitter2

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
      return; // ← ya en curso, ignora
    if (!session) session = this.createSession(sessionId);

    session.status = 'connecting'; // ← se marca YA, antes de cualquier await
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
        await session.client.logout();
      } catch {
        /* noop */
      }
      try {
        await session.client.destroy();
      } catch {
        /* noop */
      }
    }
    this.sessions.delete(sessionId);
  }

  getStatus(sessionId: string): WhatsappConnectionStatus {
    return this.sessions.get(sessionId)?.status ?? 'disconnected';
  }

  isConnected(sessionId: string): boolean {
    return this.getStatus(sessionId) === 'connected';
  }

  async getGroups(sessionId: string): Promise<WhatsappGroupInterface[]> {
    const client = this.getClient(sessionId);
    if (!client) throw new Error('WhatsApp no está conectado');
    const chats = await client.getChats();
    return chats
      .filter((c) => c.isGroup)
      .map((c) => ({ whatsappGroupId: c.id._serialized, title: c.name }));
  }

  async sendText(
    sessionId: string,
    groupId: string,
    text: string,
  ): Promise<SendResultInterface> {
    const client = this.getClient(sessionId);
    if (!client) return { ok: false, error: 'WhatsApp no está conectado' };
    try {
      await client.sendMessage(groupId, text);

      // await client.sendMessage(this.normalizeGroupId(groupId), text);
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
      await client.sendMessage(groupId, media, options);

      // await client.sendMessage(this.normalizeGroupId(groupId), media, options);
    }
    return { ok: true };
  }

  // ── privado: nada de esto sale del módulo ──────────────────
  private getClient(sessionId: string): Client | null {
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
        headless: true,
        args: [
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

    client.on('qr', (qr) => {
      session.status = 'waiting_qr';
      session.lastQrString = qr;
    });
    client.on('ready', () => {
      session.status = 'connected';
      session.lastQrString = null;
    });
    client.on('disconnected', () => {
      session.status = 'disconnected';
    });
    client.on('auth_failure', () => {
      session.status = 'auth_failed';
    });

    client.on('message', async (msg) => {
      if (msg.fromMe) return;
      const contact = await msg.getContact();
      this.eventEmitter.emit('whatsapp.message.received', {
        sessionId,
        chatId: msg.from,
        isGroup: msg.from.endsWith('@g.us'),
        contact: {
          chatId: contact.id._serialized,
          name: contact.pushname || contact.number,
          phoneNumber: contact.number,
        },
        text: msg.body,
      });
    });

    try {
      await client.initialize();
    } catch (e) {
      session.status = 'error';
      this.logger.error(
        `Error al inicializar WhatsApp para ${sessionId}`,
        e.message,
      );
    }
  }

  getAllConnectedSessionIds(): string[] {
    const result: string[] = [];
    this.sessions.forEach((session, id) => {
      if (session.status === 'connected') result.push(id);
    });
    return result;
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
}
