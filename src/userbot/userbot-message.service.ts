import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { UserbotClientService } from './userbot-client.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { TelegramGroupsService } from 'src/telegram-group/telegram-group.service';
import { ConfigService } from 'src/config/config.service';

/**
 * Servicio que maneja los mensajes privados entrantes al userbot.
 *
 * Equivalente a: src/handlers/private_handler.py (Python)
 *
 * Flujo:
 *  1. Llega un mensaje privado de Telegram
 *  2. Verifica que el remitente sea miembro de algún grupo autorizado
 *  3. Si la conversación con IA está activa en config
 *  4. Envía el texto al TelegramService (que llama a Gemini/Ollama)
 *  5. Responde con la reply generada
 *
 * También incluye un delay aleatorio "humano" de 3-8 segundos
 * antes de responder, para parecer más natural.
 */
@Injectable()
export class UserbotMessageService implements OnModuleInit {
  private readonly logger = new Logger(UserbotMessageService.name);

  constructor(
    private readonly userbotClient: UserbotClientService,
    private readonly telegramService: TelegramService,
    private readonly telegramGroupsService: TelegramGroupsService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // REGISTRO DEL HANDLER
  // ─────────────────────────────────────────────

  onModuleInit() {
    // El cliente puede no estar listo todavía — intentamos registrar
    // el handler cada 5 segundos hasta que conecte
    this._tryRegisterHandler();
  }

  private _tryRegisterHandler(attempts = 0) {
    const client = this.userbotClient.getClient();

    if (client) {
      this._registerHandler(client);
      return;
    }

    if (attempts < 24) {
      // Intentar durante 2 minutos (24 x 5s)
      setTimeout(() => this._tryRegisterHandler(attempts + 1), 5_000);
    } else {
      this.logger.warn(
        '⚠️ No se pudo registrar el handler de mensajes — userbot no conectado.',
      );
    }
  }

  private _registerHandler(client: any) {
    client.addEventHandler(
      async (event: NewMessageEvent) => {
        await this._handleMessage(event);
      },
      new NewMessage({ incoming: true }),
    );
    this.logger.log('📩 Handler de mensajes privados registrado');
  }

  // ─────────────────────────────────────────────
  // PROCESAMIENTO DE MENSAJES
  // ─────────────────────────────────────────────

  private async _handleMessage(event: NewMessageEvent): Promise<void> {
    try {
      // Solo procesar mensajes privados
      if (!event.isPrivate) return;

      const messageText = event.message?.message;

      // Ignorar mensajes vacíos (stickers, fotos sin caption, etc.)
      if (!messageText || messageText.trim() === '') {
        this.logger.debug('⏭️ Mensaje vacío ignorado (sticker/media)');
        return;
      }

      const senderId = Number(event.message?.senderId ?? 0);
      if (!senderId) return;

      // Verificar configuración
      const config = await this.configService.getConfig();
      if (!config.conversationWithAI) {
        this.logger.debug('⏸️ Conversación con IA deshabilitada en config');
        return;
      }

      // Verificar que el remitente sea miembro de algún grupo autorizado
      const isAllowed = await this._isSenderAllowed(senderId);
      if (!isAllowed) {
        this.logger.debug(
          `⛔ Mensaje de ${senderId} ignorado — no es miembro de grupos autorizados`,
        );
        return;
      }

      this.logger.log(
        `📩 Mensaje de ${senderId}: ${messageText.slice(0, 60)}...`,
      );

      // Delay humano anti-ban (3-8 segundos)
      await this._humanDelay();

      // Enviar al servicio de IA y obtener respuesta
      const result = await this.telegramService.handleMessage({
        message: messageText,
        userId: senderId,
      });

      // Responder en el chat
      if (result?.reply) {
        await event.message.respond({ message: result.reply });
        this.logger.log(`✅ Respuesta enviada a ${senderId}`);
      }
    } catch (err: any) {
      this.logger.error('❌ Error procesando mensaje privado:', err?.message);
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  /**
   * Verifica si un usuario es miembro de algún grupo con publishEnabled=true.
   * Equivalente a: group_service.allowed_members_ids() en Python.
   */
  private async _isSenderAllowed(senderId: number): Promise<boolean> {
    const groups = await this.telegramGroupsService.getPublishableGroups();
    for (const group of groups) {
      const members: { telegramUserId: number }[] = group.members || [];
      if (members.some((m) => m.telegramUserId === senderId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Delay aleatorio entre 3 y 8 segundos para parecer humano.
   * Equivalente a: utils/delays.py → human_delay() en Python.
   */
  private _humanDelay(minS = 3, maxS = 8): Promise<void> {
    const ms = (Math.random() * (maxS - minS) + minS) * 1_000;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
