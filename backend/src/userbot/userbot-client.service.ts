import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio que gestiona la conexión del userbot con Telegram via GramJS (Telethon JS).
 *
 * El userbot actúa como una CUENTA DE USUARIO real de Telegram,
 * lo que le permite enviar archivos y mensajes desde una persona,
 * iterar diálogos y participantes de grupos, etc.
 *
 * Flujo de autenticación (primera vez):
 *  1. POST /userbot/auth/start  → inicia el proceso y Telegram envía SMS
 *  2. POST /userbot/auth/code { code: "12345" } → completa la autenticación
 *  3. La sesión se guarda en ./userbot-session.txt y en TELEGRAM_SESSION del .env
 *
 * Desde la segunda vez en adelante arranca automáticamente con la sesión guardada.
 */
@Injectable()
export class UserbotClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UserbotClientService.name);

  private client: TelegramClient | null = null;
  private _status: 'disconnected' | 'waiting_code' | 'connected' | 'error' =
    'disconnected';

  /** Resuelve la promesa pendiente de código cuando el usuario llama a submitCode() */
  private pendingCodeResolve: ((code: string) => void) | null = null;

  private readonly sessionFile = path.join(
    process.cwd(),
    'userbot-session.txt',
  );

  // ─────────────────────────────────────────────
  // CICLO DE VIDA
  // ─────────────────────────────────────────────

  async onModuleInit() {
    const session = this._loadSession();
    if (session) {
      this.logger.log(
        '🔐 Sesión guardada encontrada — conectando automáticamente...',
      );
      await this._connectWithSession(session);
    } else {
      this.logger.warn(
        '⚠️ No hay sesión guardada. Llama a POST /userbot/auth/start para autenticar.',
      );
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect().catch(() => {});
    }
  }

  // ─────────────────────────────────────────────
  // AUTH FLOW
  // ─────────────────────────────────────────────

  /**
   * Inicia el flujo de autenticación.
   * Telegram enviará un código SMS al número configurado.
   */
  async startAuth(): Promise<{ ok: boolean; message: string }> {
    const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
    const apiHash = process.env.TELEGRAM_API_HASH || '';
    const phoneNumber = process.env.TELEGRAM_PHONE_NUMBER || '';

    if (!apiId || !apiHash || !phoneNumber) {
      return {
        ok: false,
        message:
          'Faltan variables de entorno: TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_PHONE_NUMBER',
      };
    }

    this._status = 'waiting_code';
    this.client = new TelegramClient(new StringSession(''), apiId, apiHash, {
      connectionRetries: 5,
    });

    // Iniciamos la conexión en background — el callback phoneCode
    // quedará bloqueado hasta que submitCode() resuelva la promesa
    this.client
      .start({
        phoneNumber: async () => phoneNumber,
        phoneCode: async () => {
          this.logger.log('📱 Esperando código de verificación...');
          return new Promise<string>((resolve) => {
            this.pendingCodeResolve = resolve;
          });
        },
        password: async () => process.env.TELEGRAM_2FA_PASSWORD || '',
        onError: (err) => this.logger.error('❌ Error en auth:', err.message),
      })
      .then(() => {
        this._status = 'connected';
        const sessionString = (this.client!.session as StringSession).save();
        this._saveSession(sessionString);
        this.logger.log('✅ Userbot autenticado y conectado');
      })
      .catch((err) => {
        this._status = 'error';
        this.logger.error('❌ Autenticación fallida:', err.message);
      });

    return {
      ok: true,
      message: `Código enviado a ${phoneNumber}. Llama a POST /userbot/auth/code con el código.`,
    };
  }

  /**
   * Recibe el código SMS y completa la autenticación.
   */
  submitCode(code: string): { ok: boolean; message: string } {
    if (!this.pendingCodeResolve) {
      return {
        ok: false,
        message:
          'No hay autenticación pendiente. Llama primero a /userbot/auth/start',
      };
    }
    this.pendingCodeResolve(code);
    this.pendingCodeResolve = null;
    return {
      ok: true,
      message: 'Código enviado, completando autenticación...',
    };
  }

  // ─────────────────────────────────────────────
  // GETTERS PÚBLICOS
  // ─────────────────────────────────────────────

  getStatus() {
    return { status: this._status };
  }

  isConnected(): boolean {
    return this._status === 'connected' && this.client !== null;
  }

  /** Retorna el cliente GramJS (solo si está conectado) */
  getClient(): TelegramClient | null {
    return this.isConnected() ? this.client : null;
  }

  // ─────────────────────────────────────────────
  // ENVÍO DE MENSAJES Y ARCHIVOS
  // ─────────────────────────────────────────────

  /**
   * Envía un mensaje de texto a un chat/grupo.
   * @param chatId  ID de Telegram del grupo (positivo para MTProto)
   */
  async sendMessage(chatId: number | bigint, text: string): Promise<void> {
    if (!this.client || !this.isConnected()) {
      throw new Error('Userbot no conectado');
    }
    // GramJS EntityLike no acepta bigint — convertir a string
    const entityId = chatId.toString();
    await this.client.sendMessage(entityId, {
      message: text,
      parseMode: 'md',
    });
  }

  /**
   * Envía uno o varios archivos (imágenes) a un grupo como álbum.
   * Acepta rutas locales ("D:\images\foto.jpg") o URLs HTTP.
   *
   * @param chatId       ID de Telegram del grupo
   * @param imagePaths   Array de rutas locales o URLs
   * @param caption      Texto que acompañará el primer archivo
   */
  async sendFiles(
    chatId: number | bigint,
    imagePaths: string[],
    caption?: string,
  ): Promise<void> {
    if (!this.client || !this.isConnected()) {
      throw new Error('Userbot no conectado');
    }

    const validPaths = imagePaths.filter((p) => p && p.trim().length > 0);
    if (validPaths.length === 0) return;

    // GramJS EntityLike no acepta bigint — convertir a string
    const entityId = chatId.toString();
    await this.client.sendFile(entityId, {
      file: validPaths.length === 1 ? validPaths[0] : (validPaths as any),
      caption: caption || '',
      parseMode: 'md',
    } as any);
  }

  // ─────────────────────────────────────────────
  // PRIVADOS
  // ─────────────────────────────────────────────

  private async _connectWithSession(sessionString: string): Promise<void> {
    const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
    const apiHash = process.env.TELEGRAM_API_HASH || '';

    if (!apiId || !apiHash) {
      this.logger.error(
        '❌ Faltan TELEGRAM_API_ID o TELEGRAM_API_HASH en el .env',
      );
      this._status = 'error';
      return;
    }

    try {
      this.client = new TelegramClient(
        new StringSession(sessionString),
        apiId,
        apiHash,
        { connectionRetries: 5 },
      );
      await this.client.connect();
      this._status = 'connected';
      this.logger.log('✅ Userbot conectado con sesión guardada');
    } catch (err: any) {
      this._status = 'error';
      this.logger.error(
        '❌ Error conectando con sesión guardada:',
        err.message,
      );
    }
  }

  private _loadSession(): string | null {
    // 1. Primero intentar desde variable de entorno
    const envSession = process.env.TELEGRAM_SESSION;
    if (envSession && envSession.trim().length > 0) return envSession;

    // 2. Si no, desde archivo local
    if (fs.existsSync(this.sessionFile)) {
      const content = fs.readFileSync(this.sessionFile, 'utf-8').trim();
      if (content.length > 0) return content;
    }

    return null;
  }

  private _saveSession(sessionString: string): void {
    try {
      fs.writeFileSync(this.sessionFile, sessionString, 'utf-8');
      this.logger.log(`💾 Sesión guardada en ${this.sessionFile}`);
      this.logger.log(
        `💡 Añade esto a tu .env para evitar re-autenticar: TELEGRAM_SESSION=${sessionString}`,
      );
    } catch (err: any) {
      this.logger.error('❌ Error guardando sesión:', err.message);
    }
  }
}
