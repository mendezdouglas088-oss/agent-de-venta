import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { PublicationService } from 'src/publication/publication.service';
import { ProductsService } from 'src/products/products.service';
import { TelegramGroupsService } from 'src/telegram-group/telegram-group.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { BotContext } from '../interfaces';
import { PaginationService } from '../services/pagination.service';
import { BotMessageService } from '../services/bot-message.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { StateManagerService } from '../services/state-manager.service';
import { CALLBACK_PREFIXES, MENU_OPTIONS } from '../constants';
import { parseSelectCallback } from '../utils';
import { UsersService } from 'src/users/users.service';

/** Máx. grupos por página — conservador para no superar el límite de Telegram */
const GROUPS_PAGE_SIZE = 8;

@Injectable()
export class PublicationHandler {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly productsService: ProductsService,
    private readonly telegramGroupsService: TelegramGroupsService,
    private readonly whatsappService: WhatsappService,
    private readonly paginationService: PaginationService,
    private readonly botMessage: BotMessageService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly stateManager: StateManagerService,
    private readonly usersService: UsersService,
  ) {}

  // ─────────────────────────────────────────────
  // LISTAR PUBLICACIONES
  // ─────────────────────────────────────────────

  async list(ctx: BotContext, page = 1): Promise<void> {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('📢 Listando publicaciones...');
    }

    try {
      await ctx.deleteMessage();
    } catch (_) {}

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    const publications = await this.publicationService.findAll(user?.id);
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, publications.length);
    const pageItems = publications.slice(start, end);

    let text = `📢 *Publicaciones* (Página ${page})\n`;

    if (publications.length === 0) {
      text = '📢 *Publicaciones*\n\nNo hay publicaciones aún.';
    } else {
      text += `Resultados: ${start + 1}-${end} de ${publications.length}\n\n`;
      pageItems.forEach((pub, index) => {
        const icon = pub.active ? '✅' : '❌';
        const productCount = pub.products?.length || 0;
        text += `${icon} ${start + index + 1}. *${pub.name}* (${productCount} productos)\n`;
      });
    }

    text += '\nSelecciona una opción 👇';

    const itemButtons = pageItems.map((pub, index) =>
      Markup.button.callback(
        `${index + 1}`,
        `${CALLBACK_PREFIXES.PUBLICATION_SELECT}_${pub.id}_PAGE_${page - 1}`,
      ),
    );

    const buttonRows = this.keyboardBuilder.chunkButtons(itemButtons, 5);
    const paginationButtons = this.keyboardBuilder.buildPaginationButtons(
      page,
      publications.length,
      pageSize,
      CALLBACK_PREFIXES.PUBLICATION_SELECT,
      false,
    );

    const keyboard = [
      ...buttonRows,
      paginationButtons.length ? paginationButtons : [],
      [
        Markup.button.callback(
          '➕ Añadir Publicación',
          'PUBLICATION_ADD_START',
        ),
      ],
      this.keyboardBuilder.buildBackToHomeButton(),
    ];

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard),
    });
  }

  // ─────────────────────────────────────────────
  // VER DETALLE
  // ─────────────────────────────────────────────

  async select(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: publicationId, page } = parseSelectCallback(callbackData);
    const numberPage = Math.ceil(page / 10);

    const publication = await this.publicationService.findOne(publicationId);

    if (!publication) {
      await ctx.answerCbQuery('❌ Publicación no encontrada');
      return;
    }

    await ctx.answerCbQuery('✅ Publicación seleccionada...');

    const status = publication.active ? '✅ Activa' : '❌ Inactiva';
    const productCount = publication.products?.length || 0;
    const telegramCount = publication.telegramGroupIds?.length || 0;
    const whatsappCount = publication.whatsappGroupIds?.length || 0;

    const text =
      `📢 Publicación Seleccionada\n\n` +
      `📝 Nombre: *${publication.name}*\n` +
      `📄 Descripción: ${publication.description || 'Sin descripción'}\n` +
      `📦 Productos: ${productCount}\n` +
      `📱 Grupos Telegram: ${telegramCount}\n` +
      `💬 Grupos WhatsApp: ${whatsappCount}\n` +
      `Estado: ${status}`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            status,
            `PUBLICATION_TOGGLE_${publicationId}_PAGE_${page}`,
          ),
        ],
        [
          Markup.button.callback(
            '⬆️ Atrás',
            `PUBLICATION_SELECT_PAGE_${numberPage + 1}`,
          ),
        ],
        this.keyboardBuilder.buildBackToHomeButton(),
      ]),
    });
  }

  async toggleActive(ctx: BotContext, callbackData: string): Promise<void> {
    const { id: publicationId } = parseSelectCallback(callbackData);
    await this.publicationService.toggleActive(publicationId);
    await ctx.answerCbQuery('✅ Estado actualizado');
    await this.select(ctx, callbackData);
  }

  // ─────────────────────────────────────────────
  // FLUJO AÑADIR PUBLICACIÓN
  //
  //  Paso 1 — SELECT_PRODUCTS   (paginado, 1 fila por producto)
  //  Paso 2 — SELECT_GROUPS     (Telegram + WhatsApp combinados, 8/pág)
  //  Paso 3 — ENTER_NAME        (texto libre)
  //  Paso 4 — ENTER_DESCRIPTION (texto libre  ó  ⚡ Auto-generar)
  // ─────────────────────────────────────────────

  async startAdd(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('➕ Añadiendo publicación...');

    this.stateManager.setUserState(ctx.from.id, {
      action: 'ADD_PUBLICATION',
      data: {
        step: 'SELECT_PRODUCTS',
        selectedProducts: [] as string[],
        selectedTelegramGroups: [] as string[],
        selectedWhatsappGroups: [] as string[],
        groupsPage: 1,
        name: '',
      },
    });

    await this.showProductSelection(ctx);
  }

  // ── PASO 1: Productos ─────────────────────────

  async showProductSelection(ctx: BotContext): Promise<void> {
    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    const products = await this.productsService.findAll(true, user?.id);
    const state = this.stateManager.getUserState(ctx.from.id);
    const selectedIds: string[] = state?.data?.selectedProducts || [];

    const buttons = products.map((product, index) => {
      const isSelected = selectedIds.includes(String(product.id));
      const icon = isSelected ? '✅' : '⬜';
      return [
        Markup.button.callback(
          `${icon} ${index + 1}. ${product.name}`,
          `PUBLICATION_TOGGLE_PRODUCT_${product.id}`,
        ),
      ];
    });

    buttons.push([
      Markup.button.callback('✔️ OK — Continuar', 'PUBLICATION_PRODUCTS_OK'),
    ]);
    buttons.push([
      Markup.button.callback('❌ Cancelar', MENU_OPTIONS.PUBLICATIONS.list),
    ]);

    const selected = selectedIds.length;
    const text =
      `📦 *Paso 1/3 — Selecciona los productos*\n\n` +
      `${selected > 0 ? `✅ ${selected} seleccionado(s)` : 'Ninguno seleccionado aún'}\n\n` +
      `Toca un producto para marcarlo / desmarcarlo.\n` +
      `Cuando termines, pulsa ✔️ OK.`;

    await this._editOrReply(ctx, text, Markup.inlineKeyboard(buttons));
  }

  async toggleProductSelection(
    ctx: BotContext,
    productId: string,
  ): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada. Empieza de nuevo.');
      return;
    }

    const selected: string[] = state.data.selectedProducts || [];
    const idx = selected.indexOf(String(productId));

    if (idx > -1) {
      selected.splice(idx, 1);
      await ctx.answerCbQuery('❌ Producto removido');
    } else {
      selected.push(String(productId));
      await ctx.answerCbQuery('✅ Producto agregado');
    }

    state.data.selectedProducts = selected;
    this.stateManager.setUserState(ctx.from.id, state);
    await this.showProductSelection(ctx);
  }

  async confirmProducts(ctx: BotContext): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada');
      return;
    }

    if (
      !state.data.selectedProducts ||
      state.data.selectedProducts.length === 0
    ) {
      await ctx.answerCbQuery('⚠️ Debes seleccionar al menos un producto');
      return;
    }

    await ctx.answerCbQuery(
      `✅ ${state.data.selectedProducts.length} producto(s) confirmado(s)`,
    );
    state.data.step = 'SELECT_GROUPS';
    state.data.groupsPage = 1;
    this.stateManager.setUserState(ctx.from.id, state);
    await this.showGroupsPage(ctx, 1);
  }

  // ── PASO 2: Grupos combinados paginados ───────

  /**
   * Construye lista unificada Telegram + WhatsApp.
   * Cada ítem: { type: 'T'|'W', id: string, label: string }
   */
  private async _buildCombinedGroups(userId?: string) {
    const [telegramGroups, whatsappGroups] = await Promise.all([
      this.telegramGroupsService.findall(userId),
      this.whatsappService.findAll(userId),
    ]);

    const tItems = telegramGroups.map((g) => ({
      type: 'T' as const,
      id: String(g.id),
      label: `📱 ${g.title}`,
    }));

    const wItems = whatsappGroups.map((g) => ({
      type: 'W' as const,
      id: g.whatsappGroupId.split('@')[0],
      label: `💬 ${g.title}`,
    }));

    return [...tItems, ...wItems];
  }

  async showGroupsPage(ctx: BotContext, page: number): Promise<void> {
    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    const allGroups = await this._buildCombinedGroups(user?.id);
    const state = this.stateManager.getUserState(ctx.from.id);
    const selTelegram: string[] = state?.data?.selectedTelegramGroups || [];
    const selWhatsapp: string[] = state?.data?.selectedWhatsappGroups || [];

    const totalGroups = allGroups.length;
    const totalPages = Math.max(1, Math.ceil(totalGroups / GROUPS_PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const start = (safePage - 1) * GROUPS_PAGE_SIZE;
    const end = Math.min(start + GROUPS_PAGE_SIZE, totalGroups);
    const pageItems = allGroups.slice(start, end);

    const totalSelected = selTelegram.length + selWhatsapp.length;

    const text =
      `🌎 *Paso 2/3 — Selecciona los grupos*\n\n` +
      `${totalSelected > 0 ? `✅ ${totalSelected} seleccionado(s)` : 'Ninguno seleccionado aún'}\n` +
      `Página ${safePage} de ${totalPages}\n\n` +
      `📱 = Telegram   💬 = WhatsApp\n` +
      `Toca un grupo para marcarlo / desmarcarlo.`;

    // Botones de grupos
    const groupButtons = pageItems.map((g) => {
      const isSelected =
        g.type === 'T'
          ? selTelegram.includes(g.id)
          : selWhatsapp.includes(g.id);
      const icon = isSelected ? '✅' : '⬜';
      return [
        Markup.button.callback(
          `${icon} ${g.label}`,
          `PUBLICATION_TOGGLE_GROUP_${g.type}_${g.id}`,
        ),
      ];
    });

    // Paginación
    const paginationRow: ReturnType<typeof Markup.button.callback>[] = [];
    if (safePage > 1) {
      paginationRow.push(
        Markup.button.callback(
          '⬅️ Anterior',
          `PUBLICATION_GROUPS_PAGE_${safePage - 1}`,
        ),
      );
    }
    if (end < totalGroups) {
      paginationRow.push(
        Markup.button.callback(
          '➡️ Siguiente',
          `PUBLICATION_GROUPS_PAGE_${safePage + 1}`,
        ),
      );
    }

    const keyboard = [
      ...groupButtons,
      ...(paginationRow.length ? [paginationRow] : []),
      [
        Markup.button.callback(
          '✔️ OK — Confirmar grupos',
          'PUBLICATION_GROUPS_OK',
        ),
      ],
      [
        Markup.button.callback(
          '⬅️ Atrás a Productos',
          'PUBLICATION_BACK_TO_PRODUCTS',
        ),
      ],
      [Markup.button.callback('❌ Cancelar', MENU_OPTIONS.PUBLICATIONS.list)],
    ];

    await this._editOrReply(ctx, text, Markup.inlineKeyboard(keyboard));
  }

  /** Cambia de página en el selector de grupos */
  async onGroupsPageChange(ctx: BotContext, page: number): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    if (state) {
      state.data.groupsPage = page;
      this.stateManager.setUserState(ctx.from.id, state);
    }
    await ctx.answerCbQuery();
    await this.showGroupsPage(ctx, page);
  }

  /** Togglea un grupo (Telegram o WhatsApp) */
  async toggleGroupSelection(
    ctx: BotContext,
    type: 'T' | 'W',
    id: string,
  ): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada. Empieza de nuevo.');
      return;
    }

    if (type === 'T') {
      const sel: string[] = state.data.selectedTelegramGroups || [];
      const idx = sel.indexOf(id);
      if (idx > -1) {
        sel.splice(idx, 1);
        await ctx.answerCbQuery('❌ Grupo Telegram removido');
      } else {
        sel.push(id);
        await ctx.answerCbQuery('✅ Grupo Telegram agregado');
      }
      state.data.selectedTelegramGroups = sel;
    } else {
      const sel: string[] = state.data.selectedWhatsappGroups || [];
      const idx = sel.indexOf(id);
      if (idx > -1) {
        sel.splice(idx, 1);
        await ctx.answerCbQuery('❌ Grupo WhatsApp removido');
      } else {
        sel.push(id);
        await ctx.answerCbQuery('✅ Grupo WhatsApp agregado');
      }
      state.data.selectedWhatsappGroups = sel;
    }

    this.stateManager.setUserState(ctx.from.id, state);
    await this.showGroupsPage(ctx, state.data.groupsPage || 1);
  }

  async confirmGroups(ctx: BotContext): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada');
      return;
    }

    const total =
      (state.data.selectedTelegramGroups?.length || 0) +
      (state.data.selectedWhatsappGroups?.length || 0);

    if (total === 0) {
      await ctx.answerCbQuery('⚠️ Selecciona al menos un grupo');
      return;
    }

    await ctx.answerCbQuery(`✅ ${total} grupo(s) confirmado(s)`);
    state.data.step = 'ENTER_NAME';
    this.stateManager.setUserState(ctx.from.id, state);

    await this._editOrReply(
      ctx,
      '📝 *Paso 3/3 — Nombre*\n\nEscribe el *nombre* de la publicación:',
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            '⬅️ Atrás a Grupos',
            'PUBLICATION_BACK_TO_GROUPS',
          ),
        ],
        [Markup.button.callback('❌ Cancelar', MENU_OPTIONS.PUBLICATIONS.list)],
      ]),
    );
  }

  // ── PASOS 3 y 4: Nombre y descripción ─────────

  async handleNameInput(ctx: BotContext, name: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (
      !state ||
      state.action !== 'ADD_PUBLICATION' ||
      state.data.step !== 'ENTER_NAME'
    ) {
      return;
    }

    if (!name.trim()) {
      await ctx.reply('⚠️ El nombre no puede estar vacío. Inténtalo de nuevo:');
      return;
    }

    state.data.name = name.trim();
    state.data.step = 'ENTER_DESCRIPTION';
    this.stateManager.setUserState(ctx.from.id, state);

    await ctx.reply(
      `✅ Nombre: *${state.data.name}*\n\n` +
        `Escribe la *descripción* de la publicación,\n` +
        `o pulsa ⚡ *Auto* para generarla desde los productos:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '⚡ Auto-generar descripción',
              'PUBLICATION_SKIP_DESC',
            ),
          ],
          [
            Markup.button.callback(
              '❌ Cancelar',
              MENU_OPTIONS.PUBLICATIONS.list,
            ),
          ],
        ]),
      },
    );
  }

  async handleDescriptionInput(
    ctx: BotContext,
    description: string,
  ): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (
      !state ||
      state.action !== 'ADD_PUBLICATION' ||
      state.data.step !== 'ENTER_DESCRIPTION'
    ) {
      return;
    }

    const finalDescription =
      description.trim() || (await this._autoDescription(state));
    await this._savePublication(ctx, state, finalDescription);
  }

  /** Botón "⚡ Auto-generar descripción" */
  async skipDescription(ctx: BotContext): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada');
      return;
    }

    await ctx.answerCbQuery('⚡ Generando descripción automática...');
    const autoDesc = await this._autoDescription(state);
    await this._savePublication(ctx, state, autoDesc);
  }

  // ── Navegación ────────────────────────────────

  async goBack(ctx: BotContext, targetStep: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'ADD_PUBLICATION') {
      await ctx.answerCbQuery('❌ Sesión expirada. Empieza de nuevo.');
      return;
    }

    await ctx.answerCbQuery('⬅️ Volviendo...');
    state.data.step = targetStep;
    this.stateManager.setUserState(ctx.from.id, state);

    if (targetStep === 'SELECT_PRODUCTS') {
      await this.showProductSelection(ctx);
    } else if (targetStep === 'SELECT_GROUPS') {
      await this.showGroupsPage(ctx, state.data.groupsPage || 1);
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────

  /**
   * Genera descripción automática: "Producto --> $precio\n"
   */
  private async _autoDescription(state: any): Promise<string> {
    const productIds: string[] = state.data.selectedProducts || [];
    if (productIds.length === 0) return state.data.name || '';

    const all = await this.productsService.findAll(true);
    const selected = all.filter((p) => productIds.includes(String(p.id)));

    return selected.map((p) => `${p.name} --> $${p.price}`).join('\n');
  }

  /** Persiste la publicación y muestra confirmación */
  private async _savePublication(
    ctx: BotContext,
    state: any,
    description: string,
  ): Promise<void> {
    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    const publication = await this.publicationService.create({
      name: state.data.name,
      description,
      productIds: state.data.selectedProducts,
      telegramGroupIds: state.data.selectedTelegramGroups,
      whatsappGroupIds: (state.data.selectedWhatsappGroups as string[]).map(
        (id) => (id.includes('@') ? id : `${id}@g.us`),
      ),
      userId: user?.id,
    });

    this.stateManager.clearUserState(ctx.from.id);

    await ctx.reply(
      `✅ *Publicación creada exitosamente!*\n\n` +
        `📝 Nombre: *${publication.name}*\n` +
        `📄 Descripción:\n${publication.description}\n\n` +
        `📦 Productos: ${publication.products?.length || 0}\n` +
        `📱 Grupos Telegram: ${publication.telegramGroupIds?.length || 0}\n` +
        `💬 Grupos WhatsApp: ${publication.whatsappGroupIds?.length || 0}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '📢 Ver Publicaciones',
              MENU_OPTIONS.PUBLICATIONS.list,
            ),
          ],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );
  }

  private async _editOrReply(
    ctx: BotContext,
    text: string,
    keyboard: any,
  ): Promise<void> {
    try {
      await ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboard });
    } catch (_) {
      try {
        await ctx.deleteMessage();
      } catch (_) {}
      await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
    }
  }
}
