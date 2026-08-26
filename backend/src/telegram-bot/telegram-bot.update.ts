import { Update, Command, Ctx, Action, On } from 'nestjs-telegraf';
import { BotContext } from './interfaces';
import {
  ProductHandler, GroupHandler, WhatsappGroupHandler, PublicationHandler,
  MessengerHandler, SettingsHandler, NavigationHandler, ConfigHandler,
  PlanHandler, AdminHandler,
} from './handlers';
import { StateManagerService } from './services/state-manager.service';
import { ProductsService } from 'src/products/products.service';
import { MENU_OPTIONS, BOT_COMMANDS, CALLBACK_PATTERNS } from './constants';
import { getMessageText, getCallbackData, getPageFromCallback } from './utils';
import { Markup } from 'telegraf';
import { PlanType } from 'src/database/entities/plan.entity';

@Update()
export class TelegramBotUpdate {
  constructor(
    private readonly productHandler: ProductHandler,
    private readonly groupHandler: GroupHandler,
    private readonly whatsappGroupHandler: WhatsappGroupHandler,
    private readonly publicationHandler: PublicationHandler,
    private readonly messengerHandler: MessengerHandler,
    private readonly settingsHandler: SettingsHandler,
    private readonly navigationHandler: NavigationHandler,
    private readonly configHandler: ConfigHandler,
    private readonly planHandler: PlanHandler,
    private readonly adminHandler: AdminHandler,
    private readonly stateManager: StateManagerService,
    private readonly productsService: ProductsService,
  ) {}

  // ============ EVENTOS DE MENSAJES ============

  @On('photo')
  async onPhoto(@Ctx() ctx: BotContext) {
    await this.productHandler.handlePhoto(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const state = this.stateManager.getUserState(ctx.from.id);
    const text = getMessageText(ctx) ?? '';

    if (state?.action === 'CONNECT_TELEGRAM_API_ID') {
      await this.configHandler.handleTelegramApiId(ctx, text);
      return;
    }
    if (state?.action === 'CONNECT_TELEGRAM_API_HASH') {
      await this.configHandler.handleTelegramApiHash(ctx, text);
      return;
    }
    if (state?.action === 'AWAITING_TRANSFER_RECEIPT') {
      await this.planHandler.handleTransferReceipt(ctx, text);
      return;
    }
    if (state?.action === 'AWAITING_PHONE_NUMBER') {
      await this.planHandler.handlePhoneNumber(ctx, text);
      return;
    }
    if (state?.action === 'SET_TIME_INTERVAL') {
      await this.settingsHandler.handleTimeInput(ctx, text);
      return;
    }
    if (state?.action === 'EDIT_PRODUCT') {
      await this.productHandler.handleTextUpdate(ctx);
      return;
    }
    if (state?.action === 'ADD_PUBLICATION') {
      if (state.data.step === 'ENTER_NAME') {
        await this.publicationHandler.handleNameInput(ctx, text);
        return;
      } else if (state.data.step === 'ENTER_DESCRIPTION') {
        await this.publicationHandler.handleDescriptionInput(ctx, text);
        return;
      }
    }

    if (BOT_COMMANDS.includes(text as (typeof BOT_COMMANDS)[number])) {
      if (text === '/help') return this.help(ctx);
      return this.start(ctx);
    }

    await ctx.deleteMessage();
  }

  @On('message')
  async onAnyMessage(@Ctx() ctx: BotContext) {
    const text = getMessageText(ctx);
    if (!text || !BOT_COMMANDS.includes(text as (typeof BOT_COMMANDS)[number])) {
      await ctx.deleteMessage();
    } else {
      if (text === '/help') return this.help(ctx);
      return this.start(ctx);
    }
  }

  // ============ COMANDOS ============

  @Command('start')
  async start(@Ctx() ctx: BotContext) {
    await this.navigationHandler.start(ctx);
  }

  @Command('help')
  async help(@Ctx() ctx: BotContext) {
    await this.navigationHandler.help(ctx);
  }

  // ============ NAVEGACIÓN ============

  @Action(MENU_OPTIONS.HOME.nameGeneral)
  async backToHome(@Ctx() ctx: BotContext) {
    await this.navigationHandler.backToHome(ctx);
  }

  @Action('PRODUCTS')
  async productsMenu(@Ctx() ctx: BotContext) {
    await this.navigationHandler.showProductsMenu(ctx);
  }

  @Action(MENU_OPTIONS.STATS)
  async stats(@Ctx() ctx: BotContext) {
    const products = await this.productsService.findAll(true);
    await this.navigationHandler.showStats(ctx, products.length);
  }

  @Action(MENU_OPTIONS.CARRITO)
  async carrito(@Ctx() ctx: BotContext) {
    await this.navigationHandler.handleCarrito(ctx);
  }

  // ============ ADMIN — USUARIOS ============

  @Action(MENU_OPTIONS.ADMIN.users)
  async adminUsers(@Ctx() ctx: BotContext) {
    await this.adminHandler.listUsers(ctx, 1);
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USERS_PAGE)
  async adminUsersPage(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USERS_PAGE);
    if (match) await this.adminHandler.listUsers(ctx, Number(match[1]));
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USER_DETAIL)
  async adminUserDetail(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USER_DETAIL);
    if (match) await this.adminHandler.userDetail(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USER_TOGGLE)
  async adminUserToggle(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USER_TOGGLE);
    if (match) await this.adminHandler.toggleUser(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USER_DELETE)
  async adminUserDelete(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USER_DELETE);
    if (match) await this.adminHandler.deleteUser(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USER_PUBLICATIONS)
  async adminUserPublications(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USER_PUBLICATIONS);
    if (match) await this.adminHandler.userPublications(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.ADMIN_USER_PRODUCTS)
  async adminUserProducts(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.ADMIN_USER_PRODUCTS);
    if (match) await this.adminHandler.userProducts(ctx, match[1]);
  }

  // ============ ADMIN — TRANSFERENCIAS ============

  @Action(MENU_OPTIONS.TRANSFERS.nameGeneral)
  async showTransfers(@Ctx() ctx: BotContext) {
    await this.adminHandler.showTransfers(ctx, 1, false);
  }

  @Action(CALLBACK_PATTERNS.TRANSFERS_PAGE)
  async transfersPage(@Ctx() ctx: BotContext) {
    const data = getCallbackData(ctx);
    const match = data.match(/^TRANSFERS_PAGE_(\d+)_(\d)$/);
    if (match) await this.adminHandler.showTransfers(ctx, Number(match[1]), match[2] === '1');
  }

  @Action(CALLBACK_PATTERNS.TRANSFER_DETAIL)
  async transferDetail(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.TRANSFER_DETAIL);
    if (match) await this.adminHandler.transferDetail(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.TRANSFER_APPROVE)
  async transferApprove(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.TRANSFER_APPROVE);
    if (match) await this.adminHandler.approveTransfer(ctx, match[1]);
  }

  @Action(CALLBACK_PATTERNS.TRANSFER_REJECT)
  async transferReject(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.TRANSFER_REJECT);
    if (match) await this.adminHandler.rejectTransfer(ctx, match[1]);
  }

  // ============ PLAN + PAGO ============

  @Action(MENU_OPTIONS.PLAN.nameGeneral)
  async planMenu(@Ctx() ctx: BotContext) {
    await this.planHandler.showPlanMenu(ctx);
  }

  @Action(MENU_OPTIONS.PLAN.selectDaily)
  async selectDailyPlan(@Ctx() ctx: BotContext) {
    await this.planHandler.selectPlan(ctx, PlanType.DAILY);
  }

  @Action(MENU_OPTIONS.PLAN.selectPro)
  async selectProPlan(@Ctx() ctx: BotContext) {
    await this.planHandler.selectPlan(ctx, PlanType.PRO);
  }

  @Action(CALLBACK_PATTERNS.PAYMENT_PLAN)
  async paymentMethod(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.PAYMENT_PLAN);
    if (match) await this.planHandler.selectPlan(ctx, match[1].toLowerCase() as PlanType);
  }

  @Action(CALLBACK_PATTERNS.PAYMENT_TRANSFERMOVIL)
  async paymentTransfermovil(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.PAYMENT_TRANSFERMOVIL);
    if (match) await this.planHandler.showTransfermovilInstructions(ctx, match[1].toLowerCase() as PlanType);
  }

  // ============ CONNECT ============

  @Action(MENU_OPTIONS.CONNECT.whatsapp)
  async connectWhatsapp(@Ctx() ctx: BotContext) {
    await this.configHandler.connectWhatsapp(ctx);
  }

  @Action(MENU_OPTIONS.CONNECT.telegram)
  async connectTelegram(@Ctx() ctx: BotContext) {
    await this.configHandler.connectTelegram(ctx);
  }

  @Action('CONFIG_QR_BACK')
  async cancelQr(@Ctx() ctx: BotContext) {
    await this.configHandler.cancelQrAndGoBack(ctx);
  }

  // ============ PRODUCTOS ============

  @Action(MENU_OPTIONS.PRODUCTS.list)
  async listProducts(@Ctx() ctx: BotContext) {
    await this.productHandler.list(ctx);
  }

  @Action(CALLBACK_PATTERNS.PRODUCT_PAGE)
  async productPage(@Ctx() ctx: BotContext) {
    const page = getPageFromCallback(ctx);
    await this.productHandler.list(ctx, page);
  }

  @Action(CALLBACK_PATTERNS.PRODUCT_SELECT)
  async selectProduct(@Ctx() ctx: BotContext) {
    await this.productHandler.select(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.PRODUCT_EDIT)
  async editProduct(@Ctx() ctx: BotContext) {
    await this.productHandler.edit(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.PRODUCT_EDIT_FIELD)
  async editProductField(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(CALLBACK_PATTERNS.PRODUCT_EDIT_FIELD);
    if (match) await this.productHandler.editField(ctx, match[1], match[2]);
  }

  @Action(CALLBACK_PATTERNS.PRODUCT_DELETE)
  async deleteProduct(@Ctx() ctx: BotContext) {
    await this.productHandler.confirmDelete(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.ADD_ITEM)
  async addItem(@Ctx() ctx: BotContext) {
    const data = getCallbackData(ctx);
    if (data.startsWith('PRODUCT_SELECT')) await this.productHandler.showAddInstructions(ctx);
    else if (data.startsWith('HELP')) await this.productHandler.showHelp(ctx);
  }

  // ============ GRUPOS TELEGRAM ============

  @Action(MENU_OPTIONS.GROUPS.nameGeneral)
  async groupsMenu(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery('🌎 Selecciona plataforma...');
    await ctx.editMessageText(
      '🌎 Gestión de Grupos\n\nSelecciona la plataforma:',
      Markup.inlineKeyboard([
        [Markup.button.callback('📱 Telegram', MENU_OPTIONS.GROUPS.telegram)],
        [Markup.button.callback('💬 WhatsApp', MENU_OPTIONS.GROUPS.whatsapp)],
        [Markup.button.callback('🏠 Home', MENU_OPTIONS.HOME.nameGeneral)],
      ]),
    );
  }

  @Action(MENU_OPTIONS.GROUPS.telegram)
  async listTelegramGroups(@Ctx() ctx: BotContext) { await this.groupHandler.list(ctx); }

  @Action(MENU_OPTIONS.GROUPS.whatsapp)
  async listWhatsappGroups(@Ctx() ctx: BotContext) { await this.whatsappGroupHandler.list(ctx); }

  @Action(MENU_OPTIONS.GROUPS.list)
  async listGroups(@Ctx() ctx: BotContext) { await this.groupHandler.list(ctx); }

  @Action(CALLBACK_PATTERNS.GROUPS_PAGE)
  async groupsPage(@Ctx() ctx: BotContext) {
    await this.groupHandler.list(ctx, getPageFromCallback(ctx));
  }

  @Action(CALLBACK_PATTERNS.GROUPS_SELECT)
  async selectGroup(@Ctx() ctx: BotContext) {
    await this.groupHandler.select(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.GROUPS_EDIT)
  async editGroup(@Ctx() ctx: BotContext) {
    await this.groupHandler.togglePublish(ctx, getCallbackData(ctx));
  }

  // ============ GRUPOS WHATSAPP ============

  @Action(CALLBACK_PATTERNS.WHATSAPP_GROUPS_PAGE)
  async whatsappGroupsPage(@Ctx() ctx: BotContext) {
    await this.whatsappGroupHandler.list(ctx, getPageFromCallback(ctx));
  }

  @Action(CALLBACK_PATTERNS.WHATSAPP_GROUPS_SELECT)
  async selectWhatsappGroup(@Ctx() ctx: BotContext) {
    await this.whatsappGroupHandler.select(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.WHATSAPP_GROUPS_EDIT)
  async editWhatsappGroup(@Ctx() ctx: BotContext) {
    await this.whatsappGroupHandler.togglePublish(ctx, getCallbackData(ctx));
  }

  // ============ PUBLICACIONES ============

  @Action(MENU_OPTIONS.PUBLICATIONS.list)
  async listPublications(@Ctx() ctx: BotContext) { await this.publicationHandler.list(ctx); }

  @Action(CALLBACK_PATTERNS.PUBLICATION_PAGE)
  async publicationPage(@Ctx() ctx: BotContext) {
    await this.publicationHandler.list(ctx, getPageFromCallback(ctx));
  }

  @Action(CALLBACK_PATTERNS.PUBLICATION_SELECT)
  async selectPublication(@Ctx() ctx: BotContext) {
    await this.publicationHandler.select(ctx, getCallbackData(ctx));
  }

  @Action(CALLBACK_PATTERNS.PUBLICATION_TOGGLE)
  async togglePublication(@Ctx() ctx: BotContext) {
    await this.publicationHandler.toggleActive(ctx, getCallbackData(ctx));
  }

  @Action('PUBLICATION_ADD_START')
  async startAddPublication(@Ctx() ctx: BotContext) { await this.publicationHandler.startAdd(ctx); }

  @Action(/PUBLICATION_TOGGLE_PRODUCT_(.+)/)
  async toggleProductSelection(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(/PUBLICATION_TOGGLE_PRODUCT_(.+)/);
    if (match) await this.publicationHandler.toggleProductSelection(ctx, match[1]);
  }

  @Action('PUBLICATION_PRODUCTS_OK')
  async confirmProducts(@Ctx() ctx: BotContext) { await this.publicationHandler.confirmProducts(ctx); }

  @Action(/^PUBLICATION_GROUPS_PAGE_(\d+)$/)
  async groupsPageChange(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(/^PUBLICATION_GROUPS_PAGE_(\d+)$/);
    if (match) await this.publicationHandler.onGroupsPageChange(ctx, Number(match[1]));
  }

  @Action(/^PUBLICATION_TOGGLE_GROUP_(T|W)_(.+)$/)
  async toggleGroupSelection(@Ctx() ctx: BotContext) {
    const match = getCallbackData(ctx).match(/^PUBLICATION_TOGGLE_GROUP_(T|W)_(.+)$/);
    if (match) await this.publicationHandler.toggleGroupSelection(ctx, match[1] as 'T' | 'W', match[2]);
  }

  @Action('PUBLICATION_GROUPS_OK')
  async confirmGroups(@Ctx() ctx: BotContext) { await this.publicationHandler.confirmGroups(ctx); }

  @Action('PUBLICATION_BACK_TO_PRODUCTS')
  async backToProducts(@Ctx() ctx: BotContext) { await this.publicationHandler.goBack(ctx, 'SELECT_PRODUCTS'); }

  @Action('PUBLICATION_BACK_TO_GROUPS')
  async backToGroups(@Ctx() ctx: BotContext) { await this.publicationHandler.goBack(ctx, 'SELECT_GROUPS'); }

  @Action('PUBLICATION_SKIP_DESC')
  async skipDescription(@Ctx() ctx: BotContext) { await this.publicationHandler.skipDescription(ctx); }

  // ============ MENSAJEROS ============

  @Action('MESSENGERS')
  async messengersMenu(@Ctx() ctx: BotContext) { await this.messengerHandler.showManagement(ctx); }

  @Action(MENU_OPTIONS.MESSENGERS.list)
  async listMessengers(@Ctx() ctx: BotContext) { await this.messengerHandler.list(ctx); }

  @Action(CALLBACK_PATTERNS.MESSENGER_PAGE)
  async messengerPage(@Ctx() ctx: BotContext) {
    await this.messengerHandler.list(ctx, getPageFromCallback(ctx));
  }

  @Action(CALLBACK_PATTERNS.MESSENGER_SELECT)
  async selectMessenger(@Ctx() ctx: BotContext) {
    await this.messengerHandler.select(ctx, getCallbackData(ctx));
  }

  // ============ SETTINGS / CONFIGURACIÓN ============

  @Action(CALLBACK_PATTERNS.SETTINGS)
  async settings(@Ctx() ctx: BotContext) {
    await this.settingsHandler.handle(ctx, getPageFromCallback(ctx));
  }

  @Action(MENU_OPTIONS.SETTINGS)
  async showConfig(@Ctx() ctx: BotContext) { await this.configHandler.showConfigMenu(ctx); }

  @Action('CONFIG_TOGGLE_PUBLISH')
  async togglePublish(@Ctx() ctx: BotContext) { await this.configHandler.togglePublish(ctx); }

  @Action('CONFIG_TOGGLE_SYNC_GROUPS')
  async toggleSyncGroups(@Ctx() ctx: BotContext) { await this.configHandler.toggleSyncGroups(ctx); }

  @Action('CONFIG_TOGGLE_SYNC_WHATSAPP')
  async toggleSyncWhatsapp(@Ctx() ctx: BotContext) { await this.configHandler.toggleSyncWhatsappGroups(ctx); }

  @Action('CONFIG_TOGGLE_DELIVERIES')
  async toggleDeliveries(@Ctx() ctx: BotContext) { await this.configHandler.toggleDeliveries(ctx); }

  @Action('CONFIG_TOGGLE_MESSENGERS')
  async toggleMessengers(@Ctx() ctx: BotContext) { await this.configHandler.toggleMessengers(ctx); }

  @Action('CONFIG_TOGGLE_AI')
  async toggleAI(@Ctx() ctx: BotContext) { await this.configHandler.toggleAI(ctx); }

  @Action('CONFIG_RESET')
  async resetConfig(@Ctx() ctx: BotContext) { await this.configHandler.resetConfig(ctx); }
}
