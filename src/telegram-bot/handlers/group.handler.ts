import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegramGroupsService } from 'src/telegram-group/telegram-group.service';
import { BotContext } from '../interfaces';
import { PaginationService } from '../services/pagination.service';
import { BotMessageService } from '../services/bot-message.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { CALLBACK_PREFIXES, MENU_OPTIONS } from '../constants';
import { parseSelectCallback } from '../utils';
import { UsersService } from 'src/users/users.service';

/**
 * Handler para operaciones de grupos de Telegram.
 *
 * Principio S: Solo maneja lógica de grupos.
 */
@Injectable()
export class GroupHandler {
  constructor(
    private readonly groupsService: TelegramGroupsService,
    private readonly paginationService: PaginationService,
    private readonly botMessage: BotMessageService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Lista grupos con paginación
   */
  async list(ctx: BotContext, page = 1): Promise<void> {
    await ctx.answerCbQuery('🌎 Listando grupos...');

    // Eliminar el mensaje anterior (detalles del grupo seleccionado)
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Ignorar si no se puede eliminar
    }

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    const groups = await this.groupsService.findall(user?.id);

    await this.paginationService.showPage({
      ctx,
      items: groups,
      page,
      getText: (group, index) => {
        const icon = group.publishEnabled ? '✅' : '❌';
        return `${icon} ${index + 1}. *${group.title}*`;
      },
      getId: (group) => group.id,
      callbackPrefix: CALLBACK_PREFIXES.GROUPS_SELECT,
      backAction: MENU_OPTIONS.HOME.nameGeneral,
      showSearch: true,
    });
  }

  /**
   * Muestra detalles de un grupo seleccionado
   */
  async select(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: groupId, page } = parseSelectCallback(callbackData);
    const numberPage = Math.ceil(page / 10);

    const group = await this.groupsService.findOne(Number(groupId));

    if (!group) {
      await ctx.answerCbQuery('❌ Grupo no encontrado');
      return;
    }

    await ctx.answerCbQuery('✅ Grupo seleccionado...');

    const enabled = group.publishEnabled ? '✅ Activo' : '❌ Desactivado';

    await ctx.editMessageText(
      `🌎 Grupo Seleccionado\n\n📦 Name: ${group.title}\nTelegram ID: ${group.telegramGroupId}\n${enabled}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              enabled,
              `GROUPS_EDIT_${groupId}_PAGE_${page}`,
            ),
          ],
          [
            Markup.button.callback(
              '⬆️ Atrás',
              `GROUPS_SELECT_PAGE_${numberPage + 1}`,
            ),
          ],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );
  }

  /**
   * Alterna el estado de publicación de un grupo
   */
  async togglePublish(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: groupId } = parseSelectCallback(callbackData);

    const group = await this.groupsService.findOne(Number(groupId));

    if (!group) {
      await ctx.answerCbQuery('❌ Grupo no encontrado');
      return;
    }

    group.publishEnabled = !group.publishEnabled;
    await this.groupsService.save(group);

    // Volver a mostrar el grupo actualizado
    await this.select(ctx, callbackData);
  }
}
