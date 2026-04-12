import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { BotContext } from '../interfaces';
import { UsersService } from 'src/users/users.service';
import { AdminGuard } from '../guards/admin.guard';
import { MENU_OPTIONS } from '../constants';
import { User } from 'src/database/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { PublicationService } from 'src/publication/publication.service';
import { TransfersService } from 'src/transfers/transfers.service';
import { PlansService } from 'src/plans/plans.service';
import { TransferStatus } from 'src/database/entities/transfer.entity';
import { PLAN_LABELS } from '../constants/plan-labels.constant';

const PAGE_SIZE = 8;

@Injectable()
export class AdminHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminGuard: AdminGuard,
    private readonly productsService: ProductsService,
    private readonly publicationService: PublicationService,
    private readonly transfersService: TransfersService,
    private readonly plansService: PlansService,
  ) {}

  private denyIfNotAdmin(ctx: BotContext): boolean {
    if (!this.adminGuard.isAdmin(ctx)) {
      ctx.answerCbQuery('⛔ Acceso denegado').catch(() => {});
      return true;
    }
    return false;
  }

  // ─── Lista de usuarios ────────────────────────────────────────────────────

  async listUsers(ctx: BotContext, page = 1): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('👥 Cargando usuarios...');

    const allUsers = await this.usersService.findAll();
    const total = allUsers.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const pageUsers = allUsers.slice(start, start + PAGE_SIZE);

    const rows = pageUsers.map((u, i) => {
      const num = start + i + 1;
      const icon = u.isActive ? '✅' : '❌';
      const name = u.firstName ?? u.username ?? u.telegramId;
      return [
        Markup.button.callback(
          `${icon} ${num}. ${name}`,
          `ADMIN_USER_DETAIL_${u.id}`,
        ),
      ];
    });

    const navRow: ReturnType<typeof Markup.button.callback>[] = [];
    if (page > 1)
      navRow.push(
        Markup.button.callback('⬅️ Anterior', `ADMIN_USERS_PAGE_${page - 1}`),
      );
    if (page < totalPages)
      navRow.push(
        Markup.button.callback('➡️ Siguiente', `ADMIN_USERS_PAGE_${page + 1}`),
      );
    if (navRow.length > 0) rows.push(navRow);
    rows.push([
      Markup.button.callback(
        MENU_OPTIONS.HOME.nameItem,
        MENU_OPTIONS.HOME.nameGeneral,
      ),
    ]);

    await ctx.editMessageText(
      `👥 *Usuarios registrados* (${total} total)\nPágina ${page}/${totalPages || 1}`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(rows) },
    );
  }

  // ─── Detalle de usuario ───────────────────────────────────────────────────

  async userDetail(ctx: BotContext, userId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('');

    const user = await this.usersService.findOne(userId);
    if (!user) {
      await ctx.answerCbQuery('❌ Usuario no encontrado');
      return;
    }

    const text = this._buildDetailText(user);
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            user.isActive ? '🔴 Desactivar' : '🟢 Activar',
            `ADMIN_USER_TOGGLE_${userId}`,
          ),
          Markup.button.callback('🗑 Eliminar', `ADMIN_USER_DELETE_${userId}`),
        ],
        [
          Markup.button.callback(
            '📢 Publicaciones',
            `ADMIN_USER_PUBS_${userId}`,
          ),
          Markup.button.callback('📦 Productos', `ADMIN_USER_PRODS_${userId}`),
        ],
        [
          Markup.button.callback(
            '⬅️ Volver a Usuarios',
            MENU_OPTIONS.ADMIN.users,
          ),
        ],
        [
          Markup.button.callback(
            MENU_OPTIONS.HOME.nameItem,
            MENU_OPTIONS.HOME.nameGeneral,
          ),
        ],
      ]),
    });
  }

  private _buildDetailText(user: User): string {
    const statusIcon = user.isActive ? '✅ Activo' : '❌ Inactivo';
    const name = user.firstName ?? '—';
    const username = user.username ? `@${user.username}` : '—';
    const plan = user.userPlan?.plan
      ? `${user.userPlan.plan.type.toUpperCase()} (${user.userPlan.isActive ? 'vigente' : 'expirado'})`
      : 'Sin plan';
    const endDate = user.userPlan?.endDate
      ? new Date(user.userPlan.endDate).toLocaleDateString('es-CO')
      : '—';
    const tgConnected = user.telegramApiId ? '✅' : '❌';

    return (
      `👤 *Detalle de usuario*\n\n` +
      `📛 Nombre: *${name}*\n` +
      `🪪 Username: ${username}\n` +
      `🆔 Telegram ID: \`${user.telegramId}\`\n` +
      `📊 Estado: ${statusIcon}\n\n` +
      `📋 Plan: *${plan}*\n` +
      `📅 Expira: ${endDate}\n\n` +
      `🔑 Telegram API: ${tgConnected}\n` +
      `📱 Teléfono: ${user.phoneNumber ?? '—'}\n` +
      `📅 Registrado: ${new Date(user.createdAt).toLocaleDateString('es-CO')}`
    );
  }

  // ─── Toggle usuario ───────────────────────────────────────────────────────

  async toggleUser(ctx: BotContext, userId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      await ctx.answerCbQuery('❌ Usuario no encontrado');
      return;
    }

    if (user.isActive) {
      await this.usersService.deactivate(userId);
      await ctx.answerCbQuery('🔴 Usuario desactivado');
    } else {
      await this.usersService.activate(userId);
      await ctx.answerCbQuery('🟢 Usuario activado');
    }
    await this.userDetail(ctx, userId);
  }

  // ─── Eliminar usuario ─────────────────────────────────────────────────────

  async deleteUser(ctx: BotContext, userId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      await ctx.answerCbQuery('❌ Usuario no encontrado');
      return;
    }

    await this.usersService.remove(userId);
    await ctx.answerCbQuery(
      `🗑 Usuario ${user.firstName ?? user.telegramId} eliminado`,
    );
    await this.listUsers(ctx, 1);
  }

  // ─── Publicaciones del usuario ────────────────────────────────────────────

  async userPublications(ctx: BotContext, userId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('');

    const user = await this.usersService.findOne(userId);
    const publications = await this.publicationService.findAll(userId);

    if (publications.length === 0) {
      await ctx.editMessageText(
        `📢 *${user?.firstName ?? 'Usuario'} — Sin publicaciones*`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '⬅️ Volver',
                `ADMIN_USER_DETAIL_${userId}`,
              ),
            ],
          ]),
        },
      );
      return;
    }

    const list = publications
      .map(
        (p, i) =>
          `${i + 1}. ${p.active ? '✅' : '❌'} *${p.name}* (${p.products?.length ?? 0} productos)`,
      )
      .join('\n');

    await ctx.editMessageText(
      `📢 *Publicaciones de ${user?.firstName ?? 'Usuario'}*\n\n${list}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Volver', `ADMIN_USER_DETAIL_${userId}`)],
        ]),
      },
    );
  }

  // ─── Productos del usuario ────────────────────────────────────────────────

  async userProducts(ctx: BotContext, userId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('');

    const user = await this.usersService.findOne(userId);
    const products = await this.productsService.findAll(true, userId);

    if (products.length === 0) {
      await ctx.editMessageText(
        `📦 *${user?.firstName ?? 'Usuario'} — Sin productos*`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '⬅️ Volver',
                `ADMIN_USER_DETAIL_${userId}`,
              ),
            ],
          ]),
        },
      );
      return;
    }

    const list = products
      .map(
        (p, i) =>
          `${i + 1}. ${p.available ? '✅' : '❌'} *${p.name}* — $${p.price}`,
      )
      .join('\n');

    await ctx.editMessageText(
      `📦 *Productos de ${user?.firstName ?? 'Usuario'}*\n\n${list}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Volver', `ADMIN_USER_DETAIL_${userId}`)],
        ]),
      },
    );
  }

  // ─── Transferencias ───────────────────────────────────────────────────────

  /**
   * Lista transferencias. showApproved=false → pendientes, true → aprobadas/rechazadas.
   * El botón "Ordenar" alterna entre los dos estados.
   */
  async showTransfers(
    ctx: BotContext,
    page = 1,
    showApproved = false,
  ): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('💸 Transferencias...');

    const allTransfers = await this.transfersService.findAll(showApproved);
    const total = allTransfers.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const start = (page - 1) * PAGE_SIZE;
    const pageTransfers = allTransfers.slice(start, start + PAGE_SIZE);

    const rows = pageTransfers.map((t, i) => {
      const num = start + i + 1;
      const icon =
        t.status === TransferStatus.APPROVED
          ? '✅'
          : t.status === TransferStatus.REJECTED
            ? '❌'
            : '⏳';
      const username = t.user?.username
        ? `@${t.user.username}`
        : (t.user?.firstName ?? t.userId.slice(0, 8));
      const planLabel = PLAN_LABELS[t.planType] ?? t.planType;
      return [
        Markup.button.callback(
          `${icon} ${num}. ${username} → ${planLabel}`,
          `TRANSFER_DETAIL_${t.id}`,
        ),
      ];
    });

    // Navegación
    const navRow: ReturnType<typeof Markup.button.callback>[] = [];
    if (page > 1)
      navRow.push(
        Markup.button.callback(
          '⬅️',
          `TRANSFERS_PAGE_${page - 1}_${showApproved ? '1' : '0'}`,
        ),
      );
    if (page < totalPages)
      navRow.push(
        Markup.button.callback(
          '➡️',
          `TRANSFERS_PAGE_${page + 1}_${showApproved ? '1' : '0'}`,
        ),
      );
    if (navRow.length) rows.push(navRow);

    // Botón sort + Atrás
    const sortLabel = showApproved ? '⏳ Ver pendientes' : '✅ Ver procesadas';
    const sortCallback = `TRANSFERS_PAGE_1_${showApproved ? '0' : '1'}`;
    rows.push([Markup.button.callback(sortLabel, sortCallback)]);
    rows.push([
      Markup.button.callback(
        MENU_OPTIONS.HOME.nameItem,
        MENU_OPTIONS.HOME.nameGeneral,
      ),
    ]);

    const modeLabel = showApproved ? 'Procesadas' : 'Pendientes';
    await ctx.editMessageText(
      `💸 *Transferencias — ${modeLabel}* (${total} total)\nPágina ${page}/${totalPages}`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(rows) },
    );
  }

  // ─── Detalle de transferencia ─────────────────────────────────────────────

  async transferDetail(ctx: BotContext, transferId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;
    await ctx.answerCbQuery('');

    const transfer = await this.transfersService.findById(transferId);
    if (!transfer) {
      await ctx.answerCbQuery('❌ Transferencia no encontrada');
      return;
    }

    const user = transfer.user;
    const planLabel = PLAN_LABELS[transfer.planType] ?? transfer.planType;
    const currentPlan = user?.userPlan?.plan?.type?.toUpperCase() ?? 'Sin plan';
    const statusIcon =
      transfer.status === TransferStatus.APPROVED
        ? '✅ Aprobada'
        : transfer.status === TransferStatus.REJECTED
          ? '❌ Rechazada'
          : '⏳ Pendiente';

    // Escapar caracteres especiales de HTML
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safe = (v: string | null | undefined) => esc(v ?? '—');

    const text =
      `💸 <b>Detalle de Transferencia</b>\n\n` +
      `👤 Usuario: <b>${safe(user?.firstName)}</b> (${user?.username ? '@' + safe(user.username) : safe(user?.telegramId)})\n` +
      `📋 Plan anterior: <b>${safe(currentPlan)}</b>\n` +
      `📋 Plan solicitado: <b>${safe(planLabel)}</b>\n` +
      `📊 Estado: ${statusIcon}\n\n` +
      `📅 Fecha: ${safe(transfer.transferDate)}\n` +
      `💳 Beneficiario: <code>${safe(transfer.beneficiary)}</code>\n` +
      `💳 Ordenante: <code>${safe(transfer.orderer)}</code>\n` +
      `💰 Monto: <b>${safe(transfer.amount)}</b>\n` +
      `🔖 Nro. Transacción: <code>${safe(transfer.transactionNumber)}</code>\n` +
      `📱 Teléfono: ${safe(user?.phoneNumber)}\n` +
      `📅 Recibido: ${new Date(transfer.createdAt).toLocaleString('es-CO')}`;

    const isApproved = transfer.status === TransferStatus.APPROVED;
    const isRejected = transfer.status === TransferStatus.REJECTED;

    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            isApproved ? '🔴 Desactivar plan' : '✅ Activar plan',
            `TRANSFER_APPROVE_${transferId}`,
          ),
          Markup.button.callback(
            isRejected ? '⚠️ Ya rechazada' : '❌ Rechazar',
            isRejected
              ? `TRANSFER_DETAIL_${transferId}`
              : `TRANSFER_REJECT_${transferId}`,
          ),
        ],
        [
          Markup.button.callback(
            '⬅️ Volver',
            MENU_OPTIONS.TRANSFERS.nameGeneral,
          ),
        ],
        [
          Markup.button.callback(
            MENU_OPTIONS.HOME.nameItem,
            MENU_OPTIONS.HOME.nameGeneral,
          ),
        ],
      ]),
    });
  }

  // ─── Aprobar transferencia → activar plan ────────────────────────────────

  async approveTransfer(ctx: BotContext, transferId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;

    const transfer = await this.transfersService.findById(transferId);
    if (!transfer) {
      await ctx.answerCbQuery('❌ No encontrada');
      return;
    }

    const user = await this.usersService.findOne(transfer.userId);
    if (!user) {
      await ctx.answerCbQuery('❌ Usuario no encontrado');
      return;
    }

    // Si ya está aprobada → desactivar el plan (toggle)
    if (transfer.status === TransferStatus.APPROVED) {
      await this.transfersService.reject(transferId);
      await this.usersService.update(user.id, {
        isActive: false,
        hasPlan: false,
      });
      await ctx.answerCbQuery('🔴 Plan desactivado');
      await this.transferDetail(ctx, transferId);
      return;
    }

    // Aprobar: activar el plan del usuario
    await this.transfersService.approve(transferId);
    await this.plansService.assignPlan(user, transfer.planType);
    await this.usersService.update(user.id, { isActive: true, hasPlan: true });
    await ctx.answerCbQuery('✅ Plan activado');

    // Notificar al usuario con mensaje temporal (5 segundos)
    const planLabel = PLAN_LABELS[transfer.planType] ?? transfer.planType;
    try {
      const notifMsg = await ctx.telegram.sendMessage(
        user.telegramId,
        `🎉 <b>Plan ${planLabel} está activo</b>\n\n¡Tu plan ha sido activado exitosamente!`,
        { parse_mode: 'HTML' },
      );

      // Guardar referencia a telegram para usar dentro del setTimeout
      const tg = ctx.telegram;
      const chatId = user.telegramId;
      const msgId = notifMsg.message_id;

      setTimeout(async () => {
        try {
          await tg.deleteMessage(chatId, msgId);
        } catch (_) {}
      }, 5000);
    } catch (_) {}

    await this.transferDetail(ctx, transferId);
  }

  // ─── Rechazar transferencia ───────────────────────────────────────────────

  async rejectTransfer(ctx: BotContext, transferId: string): Promise<void> {
    if (this.denyIfNotAdmin(ctx)) return;

    await this.transfersService.reject(transferId);
    await ctx.answerCbQuery('❌ Transferencia rechazada');
    await this.transferDetail(ctx, transferId);
  }
}
