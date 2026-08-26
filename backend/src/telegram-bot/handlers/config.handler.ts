import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { BotContext } from '../interfaces';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { ConfigManagerService } from '../services/config-manager.service';
import { StateManagerService } from '../services/state-manager.service';
import { UsersService } from 'src/users/users.service';
import { WhatsappConnectService } from 'src/whatsapp/whatsapp-connect.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { MENU_OPTIONS } from '../constants';

/** Borra silenciosamente un mensaje por ID */
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
export class ConfigHandler {
  constructor(
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly configManager: ConfigManagerService,
    private readonly stateManager: StateManagerService,
    private readonly usersService: UsersService,
    private readonly whatsappConnect: WhatsappConnectService,
    private readonly whatsappService: WhatsappService,
  ) {}

  // ── Helper: construye el estado del menú de configuración ─────────────────

  private async _buildSettingsMenu(ctx: BotContext) {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    const whatsappConnected = this.whatsappConnect.isConnected(telegramId);
    const telegramConnected =
      await this.usersService.hasTelegramCredentials(telegramId);

    return {
      config,
      whatsappConnected,
      telegramConnected,
      keyboard: this.keyboardBuilder.buildSettingsKeyboard(
        config.conversationWithAI,
        config.recommendMessengersEnable,
        config.deliveriesEnable,
        config.syncGroupsEnable,
        config.syncWhatsappGroupsEnable,
        config.publishEnabled,
        whatsappConnected,
        telegramConnected,
      ),
    };
  }

  // ── Menú de configuración (edita el mensaje existente) ────────────────────

  async showConfigMenu(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const status = await this.configManager.getFormattedStatus(telegramId);
    const whatsappConnected = this.whatsappConnect.isConnected(telegramId);
    const telegramConnected =
      await this.usersService.hasTelegramCredentials(telegramId);

    const waIcon = whatsappConnected ? '✅' : '❌';
    const tgIcon = telegramConnected ? '✅' : '❌';

    const text =
      `⚙️ CONFIGURACIÓN\n\n` +
      `${status.publish} Publicación en grupos (${status.publishInterval}s)\n` +
      `${status.syncGroups} Sync grupos Telegram (${status.syncInterval}s)\n` +
      `${status.syncWhatsappGroups} Sync grupos WhatsApp (${status.syncInterval}s)\n` +
      `${status.deliveries} Domicilios\n` +
      `${status.messengers} Recomendación mensajeros\n` +
      `${status.ai} Conversación con IA\n\n` +
      `${waIcon} WhatsApp: ${whatsappConnected ? 'Conectado' : 'No conectado'}\n` +
      `${tgIcon} Telegram: ${telegramConnected ? 'Conectado' : 'No conectado'}\n\n` +
      `Selecciona qué deseas cambiar:`;

    await ctx.editMessageText(
      text,
      this.keyboardBuilder.buildConfigKeyboard(
        status,
        whatsappConnected,
        telegramConnected,
      ),
    );
  }

  // ── Toggles (editan el mensaje, sin mensajes extra) ───────────────────────

  async togglePublish(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.togglePublish(!config.publishEnabled, telegramId);
    await ctx.answerCbQuery(
      `Publicación ${!config.publishEnabled ? '✅' : '❌'}`,
    );
    await this.showConfigMenu(ctx);
  }

  async toggleSyncGroups(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.toggleSyncGroups(
      !config.syncGroupsEnable,
      telegramId,
    );
    await ctx.answerCbQuery(
      `Sync grupos Telegram ${!config.syncGroupsEnable ? '✅' : '❌'}`,
    );
    await this.showConfigMenu(ctx);
  }

  async toggleSyncWhatsappGroups(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.toggleSyncWhatsappGroups(
      !config.syncWhatsappGroupsEnable,
      telegramId,
    );
    await ctx.answerCbQuery(
      `Sync grupos WhatsApp ${!config.syncWhatsappGroupsEnable ? '✅' : '❌'}`,
    );
    await this.showConfigMenu(ctx);
  }

  async toggleDeliveries(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.toggleDeliveries(
      !config.deliveriesEnable,
      telegramId,
    );
    await ctx.answerCbQuery(
      `Domicilios ${!config.deliveriesEnable ? '✅' : '❌'}`,
    );
    await this.showConfigMenu(ctx);
  }

  async toggleMessengers(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.toggleMessengers(
      !config.recommendMessengersEnable,
      telegramId,
    );
    await ctx.answerCbQuery(
      `Mensajeros ${!config.recommendMessengersEnable ? '✅' : '❌'}`,
    );
    await this.showConfigMenu(ctx);
  }

  async toggleAI(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from.id.toString();
    const config = await this.configManager.getConfig(telegramId);
    await this.configManager.toggleAI(!config.conversationWithAI, telegramId);
    await ctx.answerCbQuery(`IA ${!config.conversationWithAI ? '✅' : '❌'}`);
    await this.showConfigMenu(ctx);
  }

  async resetConfig(ctx: BotContext): Promise<void> {
    await this.configManager.resetConfig(ctx.from.id.toString());
    await ctx.answerCbQuery('✅ Configuración reseteada');
    await this.showConfigMenu(ctx);
  }

  // ── Connect WhatsApp ──────────────────────────────────────────────────────

  async connectWhatsapp(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('📱 Iniciando conexión WhatsApp...');
    const telegramId = ctx.from.id.toString();
    const chatId = ctx.chat.id;
    const tg = ctx.telegram;

    if (this.whatsappConnect.isConnected(telegramId)) {
      await ctx.answerCbQuery('✅ WhatsApp ya conectado');
      await this.showConfigMenu(ctx);
      return;
    }

    // Reemplazar el menú con mensaje de espera (editar en lugar de borrar+enviar)
    await ctx.editMessageText(
      '📱 *Conectando WhatsApp...*\nGenerando código QR, espera un momento.',
      { parse_mode: 'Markdown' },
    );
    const waitMsgId = (ctx.callbackQuery as any)?.message?.message_id;

    let qrMsgId: number | null = null;

    const onReady = async () => {
      // Borrar el QR
      if (qrMsgId) await del(chatId, qrMsgId, tg);

      // Sincronizar grupos
      const groups = await this.whatsappConnect.getGroups(telegramId);
      const groupCount = Array.isArray(groups) ? groups.length : 0;
      if (Array.isArray(groups) && groupCount > 0) {
        await this.whatsappService.create(groups, telegramId);
      }

      // Mostrar menú de config actualizado con ✅ WhatsApp
      const { keyboard } = await this._buildSettingsMenu(ctx);
      const menuMsg = await tg.sendMessage(
        chatId,
        '══             ⚙️ Configuración            ══',
        { reply_markup: keyboard.reply_markup },
      );

      // Notificación temporal de grupos sincronizados (5s)
      const notif = await tg.sendMessage(
        chatId,
        `✅ WhatsApp conectado — ${groupCount} grupo(s) sincronizados`,
      );
      setTimeout(() => del(chatId, notif.message_id, tg), 5000);
    };

    await this.whatsappConnect.triggerQrSend(
      telegramId,
      async (buf: Buffer) => {
        // Si ya había un QR, borrarlo
        if (qrMsgId) await del(chatId, qrMsgId, tg);
        // Borrar el mensaje de espera
        await del(chatId, waitMsgId, tg);

        const sent = await tg.sendPhoto(
          chatId,
          { source: buf },
          {
            caption:
              '📱 *Escanea este QR con WhatsApp*\n\n' +
              '1. Abre WhatsApp en tu teléfono\n' +
              '2. Ve a *Dispositivos vinculados*\n' +
              '3. Toca *Vincular dispositivo*\n' +
              '4. Escanea este código\n\n' +
              '_El QR expira en 60 segundos_',
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⬅️ Atrás', callback_data: 'CONFIG_QR_BACK' }],
              ],
            },
          },
        );
        qrMsgId = sent.message_id;
      },
      onReady,
    );
  }

  // ── Cancelar QR → volver a configuración ─────────────────────────────────

  async cancelQrAndGoBack(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('');
    this.whatsappConnect.cancelQr(ctx.from.id.toString());

    // Borrar la foto del QR
    try {
      await ctx.deleteMessage();
    } catch (_) {}

    // Mostrar menú de configuración como mensaje nuevo
    const { keyboard } = await this._buildSettingsMenu(ctx);
    await ctx.reply('══             ⚙️ Configuración            ══', {
      reply_markup: keyboard.reply_markup,
    });
  }

  // ── Connect Telegram ──────────────────────────────────────────────────────

  async connectTelegram(ctx: BotContext): Promise<void> {
    await ctx.answerCbQuery('🔑 Configurando acceso a Telegram...');

    // Reemplazar el menú con la guía (editar en lugar de enviar mensaje nuevo)
    await ctx.editMessageText(
      `🔑 *Conectar Telegram — Guía paso a paso*\n\n` +
        `Para que el bot acceda a tus grupos, proporciona tu *App API ID* y *App API Hash*.\n\n` +
        `*Pasos:*\n` +
        `1️⃣ Visita: https://my.telegram.org/apps\n` +
        `2️⃣ Inicia sesión con tu número de teléfono\n` +
        `3️⃣ En *API development tools*, crea una app si no tienes\n` +
        `4️⃣ Copia *App api\\_id*\n` +
        `5️⃣ Copia *App api\\_hash*\n\n` +
        `⚠️ Solo se usan para sincronizar tus grupos. En caso de problema puedes reportar el bot:\n` +
        `• Perfil del bot → ☰ → *Reportar*\n\n` +
        `Envía tu *App api\\_id* ahora:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.url(
              '🌐 Abrir my.telegram.org',
              'https://my.telegram.org/apps',
            ),
          ],
          [Markup.button.callback('❌ Cancelar', MENU_OPTIONS.SETTINGS)],
        ]),
      },
    );

    // Guardar el message_id de la guía para borrarlo al recibir el api_id
    const guideMsgId = (ctx.callbackQuery as any)?.message?.message_id;
    this.stateManager.setUserState(ctx.from.id, {
      action: 'CONNECT_TELEGRAM_API_ID',
      data: { guideMsgId },
    });
  }

  // ── Captura api_id ────────────────────────────────────────────────────────

  async handleTelegramApiId(ctx: BotContext, apiId: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    const { guideMsgId } = state?.data ?? {};
    const chatId = ctx.chat.id;
    const tg = ctx.telegram;
    const userMsgId = (ctx.message as any)?.message_id;

    const trimmed = apiId.trim();
    if (!/^\d+$/.test(trimmed)) {
      const errMsg = await ctx.reply(
        '❌ El *api\\_id* debe ser un número. Inténtalo de nuevo:',
        {
          parse_mode: 'Markdown',
        },
      );
      // Borrar el mensaje incorrecto y el error tras 3s
      setTimeout(async () => {
        await del(chatId, userMsgId, tg);
        await del(chatId, errMsg.message_id, tg);
      }, 3000);
      return;
    }

    // Borrar guía y mensaje del usuario con el api_id
    await del(chatId, guideMsgId, tg);
    await del(chatId, userMsgId, tg);

    // Pedir api_hash como mensaje nuevo limpio
    const hashMsg = await ctx.reply(
      `✅ *api\\_id* recibido: \`${trimmed}\`\n\nAhora envía tu *App api\\_hash*:`,
      { parse_mode: 'Markdown' },
    );

    this.stateManager.setUserState(ctx.from.id, {
      action: 'CONNECT_TELEGRAM_API_HASH',
      data: { apiId: trimmed, hashMsgId: hashMsg.message_id },
    });
  }

  // ── Captura api_hash ──────────────────────────────────────────────────────

  async handleTelegramApiHash(ctx: BotContext, apiHash: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);
    const { apiId, hashMsgId } = state?.data ?? {};
    const chatId = ctx.chat.id;
    const tg = ctx.telegram;
    const userMsgId = (ctx.message as any)?.message_id;

    if (!apiId) {
      await ctx.reply(
        '❌ Sesión expirada. Inicia el proceso desde Configuración.',
      );
      this.stateManager.clearUserState(ctx.from.id);
      return;
    }

    const telegramId = ctx.from.id.toString();
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      await ctx.reply('❌ Usuario no encontrado. Usa /start primero.');
      this.stateManager.clearUserState(ctx.from.id);
      return;
    }

    await this.usersService.saveTelegramCredentials(
      user.id,
      apiId,
      apiHash.trim(),
    );
    this.stateManager.clearUserState(ctx.from.id);

    // Borrar mensaje "pide hash" y mensaje del usuario con el hash
    await del(chatId, hashMsgId, tg);
    await del(chatId, userMsgId, tg);

    // Confirmación final → se borra sola a los 4s
    const finalMsg = await ctx.reply(
      `✅ *¡Telegram conectado exitosamente!*\n\nTus credenciales han sido guardadas. El bot sincronizará tus grupos de Telegram.\n\nUsa /start para volver al menú principal.`,
      { parse_mode: 'Markdown' },
    );
    setTimeout(() => del(chatId, finalMsg.message_id, tg), 4000);
  }
}
