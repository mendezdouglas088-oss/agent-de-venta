import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { ProductsService } from 'src/products/products.service';
import { BotContext } from '../interfaces';
import { PaginationService } from '../services/pagination.service';
import { BotMessageService } from '../services/bot-message.service';
import { StateManagerService } from '../services/state-manager.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { AdminGuard } from '../guards/admin.guard';
import { UsersService } from 'src/users/users.service';
import { CALLBACK_PREFIXES, MENU_OPTIONS } from '../constants';
import {
  parseSelectCallback,
  extractIdFromCallback,
  getMessagePhotos,
  getMessageCaption,
  getMessageText,
  getMessageId,
} from '../utils';
import { TelegramBotService } from '../telegram-bot.service';
import { parseProductCaption } from '../utils/caption-parser.util';

/**
 * Handler para todas las operaciones de productos.
 *
 * Principio S: Solo maneja lógica de productos.
 * Principio D: Depende de abstracciones (servicios inyectados).
 */
@Injectable()
export class ProductHandler {
  constructor(
    private readonly productsService: ProductsService,
    private readonly telegramBotService: TelegramBotService,
    private readonly paginationService: PaginationService,
    private readonly botMessage: BotMessageService,
    private readonly stateManager: StateManagerService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly adminGuard: AdminGuard,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Lista productos con paginación
   */
  async list(ctx: BotContext, page = 1): Promise<void> {
    await ctx.answerCbQuery('📦 Listando productos...');

    // Eliminar el mensaje anterior (foto del producto seleccionado)
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Ignorar si no se puede eliminar
    }

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    const products = await this.productsService.findAll(
      this.adminGuard.isAdmin(ctx),
      user?.id,
    );

    await this.paginationService.showPage({
      ctx,
      items: products,
      page,
      getText: (product, index) => {
        const icon = product.available ? '✅' : '❌';
        return `${icon} ${index + 1}. *${product.name}* - ${product.price}`;
      },
      getId: (product) => product.id,
      callbackPrefix: CALLBACK_PREFIXES.PRODUCT_SELECT,
      backAction: MENU_OPTIONS.PRODUCTS.nameGeneral,
      showSearch: true,
      showAddButton: true,
    });
  }

  /**
   * Muestra detalles de un producto seleccionado
   */
  async select(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: productId, page } = parseSelectCallback(callbackData);
    const numberPage = Math.ceil(page / 10);

    const product = await this.productsService.findOne(productId);

    if (!product) {
      await ctx.answerCbQuery('❌ Producto no encontrado');
      return;
    }

    // Eliminar el mensaje anterior (listado de productos)
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Ignorar si no se puede eliminar
    }

    await ctx.answerCbQuery('✅ Producto seleccionado...');

    const enabled = product.available ? '✅ Activo' : '❌ Desactivado';
    const caption = `✅ *Producto seleccionado*\n\n📦 Name: ${product.name}\n💲 Precio: ${product.price}\n🧾 Description: ${product.description}\n\n${enabled}`;

    await ctx.replyWithPhoto(
      { source: product.imageUrl },
      {
        caption,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '🗑 Eliminar',
              `DELETE_PRODUCT_${product.id}`,
            ),
            Markup.button.callback('✏️ Editar', `EDIT_PRODUCT_${product.id}`),
          ],
          [Markup.button.callback('🛒 Carrito', MENU_OPTIONS.CARRITO)],
          [
            Markup.button.callback(
              '⬆️ Atrás',
              `PRODUCT_SELECT_PAGE_${numberPage + 1}`,
            ),
          ],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );
  }

  /**
   * Muestra formulario de edición de producto
   */
  async edit(ctx: BotContext, callbackData: string): Promise<void> {
    const productId = extractIdFromCallback(callbackData);
    const product = await this.productsService.findOne(productId);

    if (!product) {
      await ctx.answerCbQuery('❌ Producto no encontrado');
      return;
    }

    await ctx.answerCbQuery('✏️ Editando producto...');

    const enabled = product.available ? '✅ Activo' : '❌ Desactivado';
    const caption = `✏️ Editar Producto\n\n📦 Name: ${product.name}\n💲 Precio: ${product.price}\n🧾 Description: ${product.description}\n\n${enabled}`;

    const currentCaption = ctx.callbackQuery?.message?.['caption'];

    if (currentCaption === caption) {
      await ctx.answerCbQuery('❌ Producto no ha sido actualizado.');
      return;
    }

    await ctx.editMessageCaption(caption, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            '📦 Nombre',
            `EDIT_PRODUCT_NAME_${product.id}`,
          ),
          Markup.button.callback(
            '💲 Precio',
            `EDIT_PRODUCT_PRICE_${product.id}`,
          ),
        ],
        [
          Markup.button.callback(
            '🧾 Description',
            `EDIT_PRODUCT_DESC_${product.id}`,
          ),
          Markup.button.callback(enabled, `EDIT_PRODUCT_ENABLED_${product.id}`),
        ],
        [Markup.button.callback('🔁 Actualizar', `EDIT_PRODUCT_${product.id}`)],
        [Markup.button.callback('⬅️ Atrás', 'PRODUCT_SELECT_PAGE_1')],
        this.keyboardBuilder.buildBackToHomeButton(),
      ]),
    });
  }

  /**
   * Maneja la edición de un campo específico
   */
  async editField(
    ctx: BotContext,
    field: string,
    productId: string,
  ): Promise<void> {
    await ctx.answerCbQuery();

    if (field === 'DELETE') {
      await this.productsService.remove(productId);
      const message = await ctx.reply('✅ Producto Eliminado.');
      this.botMessage.register(ctx.chat.id, message.message_id);
      await this.list(ctx);
      return;
    }

    // FIX: Corregido el bug - usar includes() en lugar de 'in'
    if (['NAME', 'PRICE', 'DESC'].includes(field)) {
      this.stateManager.setUserState(ctx.from.id, {
        action: 'EDIT_PRODUCT',
        field,
        productId,
      });

      const message = await ctx.reply(
        `✏️ Escribe el nuevo valor para *${field}*`,
        {
          parse_mode: 'Markdown',
        },
      );
      this.botMessage.register(ctx.chat.id, message.message_id);
    } else if (field === 'ENABLED') {
      const product = await this.productsService.findOne(productId);
      await this.productsService.update(productId, {
        available: !product.available,
      });
      await ctx.answerCbQuery('✅ Producto actualizado');
    }
  }

  /**
   * Muestra confirmación de eliminación
   */
  async confirmDelete(ctx: BotContext, callbackData: string): Promise<void> {
    const productId = extractIdFromCallback(callbackData);
    const product = await this.productsService.findOne(productId);

    if (!product) {
      await ctx.answerCbQuery('❌ Producto no encontrado');
      return;
    }

    const enabled = product.available ? '✅ Activo' : '❌ Desactivado';
    await ctx.deleteMessage();

    await ctx.replyWithPhoto(
      { source: product.imageUrl },
      {
        caption: `⚠️ Eliminar Producto\n\n📦 Name: ${product.name}\n💲 Precio: ${product.price}\n🧾 Description: ${product.description}\n\n${enabled}`,
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '🗑 Confirmar',
              `EDIT_PRODUCT_DELETE_${product.id}`,
            ),
            Markup.button.callback(
              'Cancelar',
              `PRODUCT_SELECT_${product.id}_PAGE_1`,
            ),
          ],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );
  }

  /**
   * Procesa una foto recibida para crear producto
   */
  async handlePhoto(ctx: BotContext): Promise<void> {
    const photos = getMessagePhotos(ctx);
    const caption = getMessageCaption(ctx) ?? '';

    if (!photos?.length) return;

    const bestPhoto = photos[photos.length - 1];
    const file = await ctx.telegram.getFile(bestPhoto.file_id);

    const fileData = await this.telegramBotService.downloadImage(file as any);
    const captionData = parseProductCaption(caption);

    const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
    await this.productsService.create({ ...fileData, caption: captionData, userId: user?.id });

    const message = await ctx.reply('✅ Producto creado satisfactoriamente');
    this.botMessage.deleteAfterDelay(ctx, message.message_id);
    await ctx.deleteMessage();
  }

  /**
   * Procesa texto para actualizar producto en edición
   */
  async handleTextUpdate(ctx: BotContext): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    if (!state || state.action !== 'EDIT_PRODUCT') return;

    const { field, productId } = state;
    const value = getMessageText(ctx);
    const messageId = getMessageId(ctx);

    const update: Record<string, unknown> = {};

    switch (field) {
      case 'NAME':
        update.name = value;
        break;
      case 'PRICE':
        update.price = Number(value);
        break;
      case 'DESC':
        update.description = value;
        break;
    }

    await this.productsService.update(productId, update);
    this.stateManager.clearUserState(ctx.from.id);

    const message = await ctx.reply('✅ Producto actualizado');

    this.botMessage.deleteAfterDelay(ctx, messageId, 5000);
    this.botMessage.deleteAfterDelay(ctx, message.message_id, 5000);

    await this.botMessage.clearAll(ctx);
  }

  /**
   * Muestra instrucciones para añadir producto
   */
  async showAddInstructions(ctx: BotContext): Promise<void> {
    await ctx.editMessageText(
      `➕ Añadir producto\n\n- Seleccione una imagen del producto.\n- Enviar datos en este formato:\n\nNombre:\nPrecio:\nDescripcion:\nCantidad:\n\n(NOTA: Copie y pegue este formato)`,
      Markup.inlineKeyboard([
        [Markup.button.callback('❕ Ayuda', 'HELP_ADD')],
        [Markup.button.callback('⬆️ Atrás', MENU_OPTIONS.PRODUCTS.list)],
        this.keyboardBuilder.buildBackToHomeButton(),
      ]),
    );
  }

  /**
   * Muestra ayuda para el formato de producto
   */
  async showHelp(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('Copie y pegue este formato');
    const message = await ctx.reply(
      'Nombre:\nPrecio:\nDescripcion:\nCantidad:',
    );
    this.botMessage.deleteAfterDelay(ctx, message.message_id);
  }
}
