import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { BotContext } from '../interfaces';
import { PaginationService } from '../services/pagination.service';
import { BotMessageService } from '../services/bot-message.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { CALLBACK_PREFIXES, MENU_OPTIONS } from '../constants';
import { parseSelectCallback } from '../utils';
import { UsersService } from 'src/users/users.service';

/**
 * Handler para operaciones de grupos de WhatsApp.
 * 
 * Principio S: Solo maneja lógica de grupos de WhatsApp.
 */
@Injectable()
export class WhatsappGroupHandler {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly paginationService: PaginationService,
    private readonly botMessage: BotMessageService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Lista grupos de WhatsApp con paginación
   */
  async list(ctx: BotContext, page = 1): Promise<void> {
    await ctx.answerCbQuery('💬 Listando grupos de WhatsApp...');

    // Eliminar el mensaje anterior
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Ignorar si no se puede eliminar
    }

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    const groups = await this.whatsappService.findAll(user?.id);

    await this.paginationService.showPage({
      ctx,
      items: groups,
      page,
      getText: (group, index) => {
        const icon = group.publishEnabled ? '✅' : '❌';
        return `${icon} ${index + 1}. *${group.title}*`;
      },
      getId: (group) => group.id,
      callbackPrefix: CALLBACK_PREFIXES.WHATSAPP_GROUPS_SELECT,
      backAction: MENU_OPTIONS.GROUPS.nameGeneral,
      showSearch: true,
    });
    }

  /**
   * Muestra detalles de un grupo de WhatsApp seleccionado
   */
  async select(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: internalId, page } = parseSelectCallback(callbackData);
    const numberPage = Math.ceil(page / 10);

    // Buscar por ID interno (autoincremental)
    const group = await this.whatsappService.findById(Number(internalId));

    if (!group) {
      await ctx.answerCbQuery('❌ Grupo no encontrado');
      return;
    }

    await ctx.answerCbQuery('✅ Grupo seleccionado...');

    const enabled = group.publishEnabled ? '✅ Activo' : '❌ Desactivado';

    await ctx.editMessageText(
      `💬 Grupo de WhatsApp Seleccionado\n\n📦 Name: ${group.title}\nWhatsApp ID: ${group.whatsappGroupId}\n${enabled}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(enabled, `WHATSAPP_GROUPS_EDIT_${internalId}_PAGE_${page}`)],
          [Markup.button.callback('⬆️ Atrás', `WHATSAPP_GROUPS_SELECT_PAGE_${numberPage + 1}`)],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );
  }

  /**
   * Alterna el estado de publicación de un grupo de WhatsApp
   */
  async togglePublish(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: internalId } = parseSelectCallback(callbackData);

    // Buscar por ID interno
    const group = await this.whatsappService.findById(Number(internalId));

    if (!group) {
      await ctx.answerCbQuery('❌ Grupo no encontrado');
      return;
    }

    await this.whatsappService.updatePublish(group.whatsappGroupId);
    await ctx.answerCbQuery('✅ Estado actualizado');

    // Volver a mostrar el grupo actualizado
    await this.select(ctx, callbackData);
  }
}
