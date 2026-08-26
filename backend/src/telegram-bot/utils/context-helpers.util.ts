import { BotContext } from '../interfaces';

/**
 * Helpers para acceder a propiedades del contexto de Telegraf
 * de forma segura sin errores de tipos.
 */

/**
 * Obtiene el texto del mensaje
 */
export function getMessageText(ctx: BotContext): string | undefined {
  return (ctx.message as any)?.text;
}

/**
 * Obtiene las fotos del mensaje
 */
export function getMessagePhotos(
  ctx: BotContext,
): Array<{ file_id: string }> | undefined {
  return (ctx.message as any)?.photo;
}

/**
 * Obtiene el caption del mensaje
 */
export function getMessageCaption(ctx: BotContext): string | undefined {
  return (ctx.message as any)?.caption;
}

/**
 * Obtiene el ID del mensaje
 */
export function getMessageId(ctx: BotContext): number | undefined {
  return (ctx.message as any)?.message_id;
}

/**
 * Obtiene el data del callback query
 */
export function getCallbackData(ctx: BotContext): string {
  return (ctx.callbackQuery as any)?.data ?? '';
}

/**
 * Extrae el número de página del callback data
 */
export function getPageFromCallback(ctx: BotContext): number {
  const data = getCallbackData(ctx);
  return Number(data.split('_').pop());
}
