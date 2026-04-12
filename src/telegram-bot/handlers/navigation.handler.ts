import { Injectable } from '@nestjs/common';
import { BotContext } from '../interfaces';
import { BotMessageService } from '../services/bot-message.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { StateManagerService } from '../services/state-manager.service';
import { AdminGuard } from '../guards/admin.guard';
import { MessengerHandler } from './messenger.handler';
import { UsersService } from 'src/users/users.service';
import { PlansService } from 'src/plans/plans.service';
import { TransfersService } from 'src/transfers/transfers.service';

@Injectable()
export class NavigationHandler {
  constructor(
    private readonly botMessage: BotMessageService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly stateManager: StateManagerService,
    private readonly adminGuard: AdminGuard,
    private readonly messengerHandler: MessengerHandler,
    private readonly userService: UsersService,
    private readonly plansService: PlansService,
    private readonly transfersService: TransfersService,
  ) {}

  async start(ctx: BotContext): Promise<void> {
    if (!(await this.adminGuard.checkOrDeny(ctx))) return;

    const telegramId = ctx.from.id.toString();
    const isAdmin = this.adminGuard.isAdmin(ctx);
    const isSuperAdmin = this.adminGuard.isSuperAdmin(ctx);

    // Crear o recuperar usuario
    let user = await this.userService.create({
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      telegramBotToken: ctx.telegram.token,
      telegramId,
    });

    if (!user) user = await this.userService.findByTelegramId(telegramId);

    // El admin NO tiene plan — puede usar todo sin restricciones
    // Los usuarios normales reciben plan Free si no tienen ninguno
    if (user && !isAdmin && !user.userPlan) {
      await this.plansService.assignFreePlan(user);
    }

    if (this.stateManager.getMessages(ctx.chat.id).length > 0) {
      await this.botMessage.clearAll(ctx);
    }

    if (ctx.message?.message_id) {
      this.botMessage.register(ctx.chat.id, ctx.message.message_id);
    }

    const mainMenu = this.keyboardBuilder.buildMainMenu(isAdmin, isSuperAdmin);

    const welcomeText =
      `📌 *Comandos disponibles:*\n` +
      `/start — Menú principal\n` +
      `/help — Ayuda\n\n` +
      mainMenu.text;

    const message = await ctx.reply(welcomeText, {
      ...mainMenu.options,
      parse_mode: 'Markdown',
    });
    this.botMessage.register(ctx.chat.id, message.message_id);
  }

  async help(ctx: BotContext): Promise<void> {
    await ctx.reply(
      `ℹ️ *Ayuda — Comandos disponibles*\n\n` +
        `/start — Abre el menú principal\n` +
        `/help — Muestra este mensaje de ayuda\n\n` +
        `_Si tienes problemas, contacta al administrador._`,
      { parse_mode: 'Markdown' },
    );
  }

  async backToHome(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('Volviendo al menú principal...');
    const isAdmin = this.adminGuard.isAdmin(ctx);
    const isSuperAdmin = this.adminGuard.isSuperAdmin(ctx);
    const mainMenu = this.keyboardBuilder.buildMainMenu(isAdmin, isSuperAdmin);

    if (this.botMessage.isPhotoMessage(ctx)) {
      await ctx.deleteMessage();
      await ctx.reply(mainMenu.text, mainMenu.options);
    } else {
      await ctx.editMessageText(mainMenu.text, mainMenu.options);
    }
  }

  async showStats(ctx: BotContext, productCount: number): Promise<void> {
    const messengerCount = this.messengerHandler.getTotal();
    const isAdmin = this.adminGuard.isAdmin(ctx);
    const isSuperAdmin = this.adminGuard.isSuperAdmin(ctx);
    await ctx.editMessageText(
      `📊 Estadísticas\n\n- Total de productos: ${productCount}\n- Total de mensajeros: ${messengerCount}`,
      this.keyboardBuilder.buildMainMenu(isAdmin, isSuperAdmin).options,
    );
  }

  async handleCarrito(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('Producto añadido al carrito 🛒');
  }

  async showProductsMenu(ctx: BotContext): Promise<void> {
    await ctx.editMessageText(
      '📦 Gestión de productos',
      this.keyboardBuilder.buildProductManagementKeyboard(),
    );
  }
}
