import { Injectable } from '@nestjs/common';
import { BotContext } from '../interfaces';
import { StateManagerService } from './state-manager.service';

/**
 * Servicio para gestionar mensajes del bot en Telegram.
 *
 * Principio S: Solo se encarga de operaciones sobre mensajes.
 */
@Injectable()
export class BotMessageService {
  constructor(private readonly stateManager: StateManagerService) {}

  /**
   * Registra un mensaje enviado por el bot para poder eliminarlo después
   */
  register(chatId: number, messageId: number): void {
    this.stateManager.registerMessage(chatId, messageId);
  }

  /**
   * Elimina todos los mensajes del bot en un chat
   */
  async clearAll(ctx: BotContext): Promise<void> {
    const chatId = ctx.chat.id;
    const messages = this.stateManager.getMessages(chatId);

    for (const messageId of messages) {
      try {
        await ctx.telegram.deleteMessage(chatId, messageId);
      } catch {
        // Ignorar errores (mensaje ya eliminado o sin permisos)
      }
    }

    this.stateManager.clearMessages(chatId);
  }

  /**
   * Elimina un mensaje después de un delay
   */
  deleteAfterDelay(ctx: BotContext, messageId: number, delayMs = 5000): void {
    setTimeout(async () => {
      try {
        await ctx.deleteMessage(messageId);
      } catch {
        // Ignorar errores
      }
    }, delayMs);
  }

  /**
   * Verifica si el mensaje actual es una foto (para saber cómo responder)
   */
  isPhotoMessage(ctx: BotContext): boolean {
    const callbackQuery = ctx.update?.['callback_query'];
    return callbackQuery?.message && 'photo' in callbackQuery.message;
  }
}
