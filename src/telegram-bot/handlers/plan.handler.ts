import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { BotContext } from '../interfaces';
import { PlansService } from 'src/plans/plans.service';
import { UsersService } from 'src/users/users.service';
import { TransfersService } from 'src/transfers/transfers.service';
import { PlanType, PLAN_CONFIGS } from 'src/database/entities/plan.entity';
import { MENU_OPTIONS } from '../constants';
import { StateManagerService } from '../services/state-manager.service';

const PLAN_LABELS: Record<string, string> = {
  [PlanType.DAILY]: '🟡 Daily',
  [PlanType.PRO]: '🔵 Pro',
  [PlanType.FREE]: '⚪ Free',
};

/** Borra un mensaje silenciosamente */
async function del(
  chatId: number | string,
  msgId: number,
  tg: any,
): Promise<void> {
  try {
    await tg.deleteMessage(chatId, msgId);
  } catch (_) {}
}

@Injectable()
export class PlanHandler {
  constructor(
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
    private readonly transfersService: TransfersService,
    private readonly stateManager: StateManagerService,
  ) {}

  // ── Menú de planes ────────────────────────────────────────────────────────

  async showPlanMenu(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('📋 Planes disponibles...');

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );

    let currentPlanText = '📋 Plan actual: *Free*';
    if (user?.userPlan?.isActive) {
      const remainingDays = await this.plansService.getRemainingDays(user.id);
      const planName = user.userPlan.plan.type.toUpperCase();
      currentPlanText = `✅ Plan actual: *${planName}* — ${remainingDays} día(s) restantes`;
    }

    const text =
      `📋 *Planes Disponibles*\n\n` +
      `${currentPlanText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🟡 *Daily* — 1 mes — *${PLAN_CONFIGS[PlanType.DAILY].price} CUP*\n` +
      `• 📢 1,000 publicaciones\n• 🌎 5 grupos\n• 🤖 Auto-reply: ❌\n• 👥 Roles: ❌\n\n` +
      `🔵 *Pro* — 1 mes — *${PLAN_CONFIGS[PlanType.PRO].price} CUP*\n` +
      `• 📢 2,000 publicaciones\n• 🌎 13 grupos\n• 🤖 Auto-reply: ✅\n• 👥 Roles: ✅\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n_Selecciona el plan que deseas:_`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🟡 Daily', MENU_OPTIONS.PLAN.selectDaily)],
        [Markup.button.callback('🔵 Pro', MENU_OPTIONS.PLAN.selectPro)],
        [
          Markup.button.callback(
            MENU_OPTIONS.HOME.nameItem,
            MENU_OPTIONS.HOME.nameGeneral,
          ),
        ],
      ]),
    });
  }

  // ── Selección de plan → menú método de pago (edita el mensaje existente) ──

  async selectPlan(ctx: BotContext, planType: PlanType): Promise<void> {
    await ctx.answerCbQuery('');
    const label = PLAN_LABELS[planType] ?? planType;
    const price = PLAN_CONFIGS[planType]?.price ?? 0;

    await ctx.editMessageText(
      `💳 *Método de Pago*\n\nPlan seleccionado: *${label}*\nPrecio: *${price} CUP*\n\nSelecciona cómo deseas pagar:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '📲 Transfermóvil',
              `PAYMENT_TM_${planType.toUpperCase()}`,
            ),
          ],
          [
            Markup.button.callback(
              '⬅️ Volver a Planes',
              MENU_OPTIONS.PLAN.nameGeneral,
            ),
          ],
          [
            Markup.button.callback(
              MENU_OPTIONS.HOME.nameItem,
              MENU_OPTIONS.HOME.nameGeneral,
            ),
          ],
        ]),
      },
    );
  }

  // ── Instrucciones Transfermóvil (edita el mensaje existente) ─────────────

  async showTransfermovilInstructions(
    ctx: BotContext,
    planType: PlanType,
  ): Promise<void> {
    await ctx.answerCbQuery('');
    const label = PLAN_LABELS[planType] ?? planType;
    const price = PLAN_CONFIGS[planType]?.price ?? 0;
    const cardNumber = process.env.TRANSFERMOVIL_CARD_NUMBER ?? '——';

    // Editar el mensaje del menú actual con las instrucciones
    await ctx.editMessageText(
      `📲 *Pago por Transfermóvil*\n\n` +
        `Para solicitar el plan *${label}*, transfiere *${price} CUP* a la tarjeta:\n\n` +
        `\`${cardNumber}\`\n\n` +
        `Una vez hecha la transferencia, copia el *mensaje de confirmación* que te envió la app y envíalo aquí.\n\n` +
        `_El menú desaparecerá cuando envíes el comprobante._`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '⬅️ Volver',
              `PAYMENT_METHOD_${planType.toUpperCase()}`,
            ),
          ],
          [
            Markup.button.callback(
              MENU_OPTIONS.HOME.nameItem,
              MENU_OPTIONS.HOME.nameGeneral,
            ),
          ],
        ]),
      },
    );

    // Guardar el message_id de las instrucciones para borrarlo al recibir el comprobante
    const instrMsgId = (ctx.callbackQuery as any)?.message?.message_id;

    this.stateManager.setUserState(ctx.from.id, {
      action: 'AWAITING_TRANSFER_RECEIPT',
      data: { planType, instrMsgId },
    });
  }

  // ── Procesa el comprobante ────────────────────────────────────────────────

  async handleTransferReceipt(
    ctx: BotContext,
    receiptText: string,
  ): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    const { planType, instrMsgId } = state?.data ?? {};
    const chatId = ctx.chat.id;
    const tg = ctx.telegram;

    // Texto inválido → avisar brevemente y borrar ambos mensajes
    if (!this.transfersService.isReceiptText(receiptText)) {
      const errMsg = await ctx.reply(
        '❌ Comprobante inválido. Envía el mensaje completo de Transfermóvil.',
      );
      const userMsgId = (ctx.message as any)?.message_id;

      setTimeout(async () => {
        await del(chatId, errMsg.message_id, tg);
        if (userMsgId) await del(chatId, userMsgId, tg);
      }, 3000);
      return;
    }

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    if (!user) return;

    const receiptMsgId = (ctx.message as any)?.message_id;
    const transfer = await this.transfersService.createFromReceipt(
      user.id,
      planType,
      receiptText,
    );

    // Borrar instrucciones y el comprobante del usuario
    await del(chatId, instrMsgId, tg);
    await del(chatId, receiptMsgId, tg);

    // Enviar paso siguiente (pedir teléfono) como nuevo mensaje limpio
    const phoneMsg = await ctx.reply(
      `✅ *Comprobante recibido.*\n\nPor favor envía tu *número de teléfono* para poder contactarte en caso de cualquier problema:`,
      { parse_mode: 'Markdown' },
    );

    this.stateManager.setUserState(ctx.from.id, {
      action: 'AWAITING_PHONE_NUMBER',
      data: {
        planType,
        transferId: transfer.id,
        phoneMsgId: phoneMsg.message_id,
      },
    });
  }

  // ── Procesa el número de teléfono ────────────────────────────────────────

  async handlePhoneNumber(ctx: BotContext, phone: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    const { planType, phoneMsgId } = state?.data ?? {};
    const chatId = ctx.chat.id;
    const tg = ctx.telegram;

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );
    if (!user) return;

    const userPhoneMsgId = (ctx.message as any)?.message_id;
    await this.usersService.savePhoneNumber(
      user.id,
      phone.trim().replace(/\s/g, ''),
    );
    this.stateManager.clearUserState(ctx.from.id);

    // Borrar: mensaje "pide teléfono" + mensaje del usuario con el teléfono
    await del(chatId, phoneMsgId, tg);
    await del(chatId, userPhoneMsgId, tg);

    // Notificar al admin
    await this._notifyAdmin(ctx, user, planType);

    // Confirmación final → se borra sola a los 4s
    const finalMsg = await ctx.reply(
      `✅ *Datos guardados satisfactoriamente. Espere confirmación.*`,
      { parse_mode: 'Markdown' },
    );

    setTimeout(() => del(chatId, finalMsg.message_id, tg), 4000);
  }

  // ── Notificación al admin ─────────────────────────────────────────────────

  private async _notifyAdmin(
    ctx: BotContext,
    user: any,
    planType?: PlanType,
  ): Promise<void> {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    if (!adminId) return;

    const pendingCount = await this.transfersService.countPending();
    const planLabel = planType
      ? (PLAN_LABELS[planType] ?? planType)
      : 'desconocido';
    const name = user.firstName ?? user.username ?? user.telegramId;

    try {
      await ctx.telegram.sendMessage(
        adminId,
        `💸 *Nueva transferencia pendiente*\n\n` +
          `👤 Usuario: *${name}*\n` +
          `📋 Plan: *${planLabel}*\n` +
          `📊 Total pendientes: *${pendingCount}*\n\n` +
          `Usa 💸 Transferencias en el menú para revisarla.`,
        { parse_mode: 'Markdown' },
      );
    } catch (_) {}
  }
}
