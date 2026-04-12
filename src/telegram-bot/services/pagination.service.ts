import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { BotContext, PaginationOptions } from '../interfaces';
import { KeyboardBuilderService } from './keyboard-builder.service';
import { BotMessageService } from './bot-message.service';
import { MENU_OPTIONS } from '../constants';

/**
 * Servicio para mostrar listados paginados.
 *
 * Principio S: Solo se encarga de la lógica de paginación.
 * Principio O: Genérico, funciona con cualquier tipo de item.
 */
@Injectable()
export class PaginationService {
  constructor(
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly botMessage: BotMessageService,
  ) {}

  /**
   * Muestra una página de items con paginación
   */
  async showPage<T>(options: PaginationOptions<T>): Promise<void> {
    const {
      ctx,
      items,
      page = 1,
      pageSize = 10,
      getText,
      getId,
      callbackPrefix,
      showSearch = false,
      showAddButton = false,
    } = options;

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, items.length);
    const pageItems = items.slice(start, end);

    // Construir texto del listado
    let text = `📦 *Listado* (Página ${page})\n`;
    text += `Resultados: ${start + 1}-${end} de ${items.length}\n\n`;

    pageItems.forEach((item, index) => {
      text += getText(item, index) + '\n';
    });

    text += '\n';
    text += `Si tiene algún problema, contacte: @${process.env.TELEGRAM_ADMIN_ID}\n`;
    text += '\nSelecciona una opción 👇';

    // Botones numerados para cada item
    const itemButtons = pageItems.map((item, index) =>
      Markup.button.callback(
        `${index + 1}`,
        `${callbackPrefix}_${getId(item)}_PAGE_${page - 1}`,
      ),
    );

    // Dividir en filas de 5
    const buttonRows = this.keyboardBuilder.chunkButtons(itemButtons, 5);

    // Botones de paginación
    const paginationButtons = this.keyboardBuilder.buildPaginationButtons(
      page,
      items.length,
      pageSize,
      callbackPrefix,
      showSearch,
    );

    // Construir teclado completo
    const keyboard = [
      ...buttonRows,
      paginationButtons.length ? paginationButtons : [],
    ];

    // Botón de añadir si aplica
    if (showAddButton) {
      keyboard.push([
        Markup.button.callback('➕ Añadir', `${callbackPrefix}_ADD`),
      ]);
    }

    // Botón de volver
    keyboard.push(
      this.keyboardBuilder.buildBackButton(MENU_OPTIONS.HOME.nameGeneral),
    );

    // Enviar o editar mensaje según el contexto
    if (this.botMessage.isPhotoMessage(ctx)) {
      // Si es un mensaje con foto, eliminar y enviar nuevo
      try {
        await ctx.deleteMessage();
      } catch (error) {
        // Ignorar si no se puede eliminar
      }
      const message = await ctx.reply(text, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(keyboard),
      });
      this.botMessage.register(ctx.chat.id, message.message_id);
    } else {
      // Si es un mensaje de texto, editar directamente
      try {
        await ctx.editMessageText(text, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(keyboard),
        });
      } catch (error) {
        // Si falla la edición, eliminar y enviar nuevo
        try {
          await ctx.deleteMessage();
        } catch (deleteError) {
          // Ignorar si no se puede eliminar
        }
        const message = await ctx.reply(text, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(keyboard),
        });
        this.botMessage.register(ctx.chat.id, message.message_id);
      }
    }
  }
}
