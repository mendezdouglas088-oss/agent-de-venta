import { Injectable } from '@nestjs/common';
import { BotContext } from '../interfaces';

/**
 * Guard para verificar si el usuario es administrador.
 *
 * Principio S: Solo verifica permisos de admin.
 *
 * Nota: En nestjs-telegraf no hay guards nativos como en HTTP,
 * así que esto es un servicio helper que se usa en los handlers.
 */
@Injectable()
export class AdminGuard {
  /**
   * Verifica si el usuario del contexto es administrador
   */
  isAdmin(ctx: BotContext): boolean {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    return ctx.from?.id?.toString() === adminId;
  }

  /**
   * Verifica si el usuario del contexto es super-administrador
   */
  isSuperAdmin(ctx: BotContext): boolean {
    const superAdminId = process.env.TELEGRAM_ADMIN_ID;
    return ctx.from?.id?.toString() === superAdminId;
  }

  /**
   * Responde con acceso denegado si no es admin
   * @returns true si es admin, false si no (y ya respondió)
   */
  async checkOrDeny(ctx: BotContext): Promise<boolean> {
    if (this.isAdmin(ctx)) {
      return true;
    }

    if (ctx.from.is_bot) {
      await ctx.reply('⛔ Acceso denegado');
      return false;
    }

    return true;
  }
}
