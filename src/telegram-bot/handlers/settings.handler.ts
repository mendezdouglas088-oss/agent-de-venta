import { Injectable } from '@nestjs/common';
import { BotContext } from '../interfaces';
import { StateManagerService } from '../services/state-manager.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { ConfigManagerService } from '../services/config-manager.service';
import { BotMessageService } from '../services';
import { parseTimeString, getTimeDescription } from '../utils/time-parser.util';
import { WhatsappConnectService } from 'src/whatsapp/whatsapp-connect.service';
import { UsersService } from 'src/users/users.service';

/**
 * Handler para configuración del bot.
 *
 * Principio S: Solo maneja lógica de configuración.
 * Principio D: Depende de ConfigManagerService para persistencia.
 */
@Injectable()
export class SettingsHandler {
  constructor(
    private readonly stateManager: StateManagerService,
    private readonly keyboardBuilder: KeyboardBuilderService,
    private readonly configManager: ConfigManagerService,
    private readonly botMessage: BotMessageService,
    private readonly whatsappConnect: WhatsappConnectService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Muestra y maneja el menú de configuración
   */
  async handle(ctx: BotContext, option: number): Promise<void> {
    const config = await this.configManager.getConfig(ctx.from.id.toString());
    let iaActive = config.conversationWithAI;
    let msgActive = config.recommendMessengersEnable;
    let deliveriesEnabled = config.deliveriesEnable;
    let syncTelegramGroupsEnabled = config.syncGroupsEnable;
    let syncWhatsappGroupsEnabled = config.syncWhatsappGroupsEnable;
    let publishEnabled = config.publishEnabled;

    try {
      switch (option) {
        case 1:
          // Toggle conversación con IA
          iaActive = !iaActive;
          await this.configManager.toggleAI(iaActive, ctx.from.id.toString());
          this.stateManager.setConversationActive(iaActive);
          await ctx.answerCbQuery(
            iaActive
              ? '✅ Conversación con IA activada'
              : '❌ Conversación con IA desactivada',
          );
          break;

        case 2:
          // Toggle recomendación de mensajeros
          msgActive = !msgActive;
          await this.configManager.toggleMessengers(
            msgActive,
            ctx.from.id.toString(),
          );
          await ctx.answerCbQuery(
            msgActive
              ? '✅ Recomendación de mensajeros activada'
              : '❌ Recomendación de mensajeros desactivada',
          );
          break;

        case 3:
          // Toggle domicilios
          deliveriesEnabled = !deliveriesEnabled;
          await this.configManager.toggleDeliveries(
            deliveriesEnabled,
            ctx.from.id.toString(),
          );
          await ctx.answerCbQuery(
            deliveriesEnabled
              ? '✅ Domicilios activados'
              : '❌ Domicilios desactivados',
          );
          break;

        case 4:
          // Toggle sync de grupos
          syncTelegramGroupsEnabled = !syncTelegramGroupsEnabled;
          await this.configManager.toggleSyncGroups(
            syncTelegramGroupsEnabled,
            ctx.from.id.toString(),
          );
          await ctx.answerCbQuery(
            syncTelegramGroupsEnabled
              ? '✅ Sync de grupos Telegram activado'
              : '❌ Sync de grupos Telegram desactivado',
          );
          break;

        case 5:
          // Toggle publicacion de productos
          publishEnabled = !publishEnabled;
          await this.configManager.togglePublish(
            publishEnabled,
            ctx.from.id.toString(),
          );
          await ctx.answerCbQuery(
            publishEnabled
              ? '✅ Publicación en Grupos activada'
              : '❌ Publicación en Grupos desactivada',
          );
          break;

        case 6:
          // Solicitar tiempo para publicación
          const msg6 = await ctx.reply(
            '⏱️ Ingrese el intervalo de publicación.\nFormatos: 5s, 10m, 2d, 1S, 3M\n(s=segundos, m=minutos, d=días, S=semanas, M=meses)',
          );
          this.stateManager.setUserState(ctx.from.id, {
            action: 'SET_TIME_INTERVAL',
            field: 'publishInterval',
            productId: '',
            settingType: 'PUBLISH_INTERVAL',
            requestMessageId: msg6.message_id,
          });
          await ctx.answerCbQuery('⏱️ Escriba el tiempo');
          break;

        case 7:
          // Solicitar tiempo para sync de grupos
          const msg7 = await ctx.reply(
            '⏱️ Ingrese el intervalo de sincronización.\nFormatos: 5s, 10m, 2d, 1S, 3M\n(s=segundos, m=minutos, d=días, S=semanas, M=meses)',
          );
          this.stateManager.setUserState(ctx.from.id, {
            action: 'SET_TIME_INTERVAL',
            field: 'syncInterval',
            productId: '',
            settingType: 'SYNC_INTERVAL',
            requestMessageId: msg7.message_id,
          });
          await ctx.answerCbQuery('⏱️ Escriba el tiempo');
          break;

        case 8:
          // Solicitar tiempo para refresh de configuración
          const msg8 = await ctx.reply(
            '⏱️ Ingrese el intervalo de refresh de configuración.\nFormatos: 5s, 10m, 2d, 1S, 3M\n(s=segundos, m=minutos, d=días, S=semanas, M=meses)',
          );
          this.stateManager.setUserState(ctx.from.id, {
            action: 'SET_TIME_INTERVAL',
            field: 'configRefreshInterval',
            productId: '',
            settingType: 'CONFIG_REFRESH_INTERVAL',
            requestMessageId: msg8.message_id,
          });
          await ctx.answerCbQuery('⏱️ Escriba el tiempo');
          break;

        case 9:
          const status = await this.configManager.getFormattedStatus(
            ctx.from.id.toString(),
          );
          const statusText = `
              📊 Estado de Configuración Actual:\n\n
              ${status.publish} Publicación (${status.publishInterval}s)
              ${status.syncGroups} Sync Grupos (${status.syncInterval}s)
              ${status.deliveries} Domicilios
              ${status.messengers} Mensajeros
              ${status.ai} Conversación IA
              ✅ Refresh Config: ${status.configRefreshInterval}s

          `;
          await ctx.answerCbQuery('✅ Estado se mostrara por 15 segundos');

          const messageState = await ctx.reply(statusText);
          this.botMessage.deleteAfterDelay(
            ctx,
            messageState.message_id,
            15 * 1000,
          );
          break;

        case 10:
          // Toggle sync de grupos de whatsapp
          syncWhatsappGroupsEnabled = !syncWhatsappGroupsEnabled;
          await this.configManager.toggleSyncWhatsappGroups(
            syncWhatsappGroupsEnabled,
            ctx.from.id.toString(),
          );
          await ctx.answerCbQuery(
            syncWhatsappGroupsEnabled
              ? '✅ Sync de grupos Whatsapp activado'
              : '❌ Sync de grupos Whatsapp desactivado',
          );
          break;

        case 0:
        default:
          // Solo mostrar menú
          break;
      }

      // Obtener configuración actualizada para mostrar
      const updatedConfig = await this.configManager.getConfig(
        ctx.from.id.toString(),
      );
      iaActive = updatedConfig.conversationWithAI;
      msgActive = updatedConfig.recommendMessengersEnable;

      const whatsappConnected = this.whatsappConnect.isConnected(
        ctx.from.id.toString(),
      );
      const telegramConnected = await this.usersService.hasTelegramCredentials(
        ctx.from.id.toString(),
      );

      await ctx.editMessageText(
        '══             ⚙️ Configuración            ══',
        this.keyboardBuilder.buildSettingsKeyboard(
          iaActive,
          msgActive,
          deliveriesEnabled,
          syncTelegramGroupsEnabled,
          syncWhatsappGroupsEnabled,
          publishEnabled,
          whatsappConnected,
          telegramConnected,
        ),
      );
    } catch (e: any) {
      // Ignorar error si el mensaje no cambió
      if (!e.description?.includes('message is not modified')) {
        throw e;
      }
    }
  }

  /**
   * Verifica si la conversación con IA está activa
   */
  async isConversationActive(ctx: BotContext): Promise<boolean> {
    const config = await this.configManager.getConfig(ctx.from.id.toString());
    return config.conversationWithAI;
  }

  /**
   * Procesa la entrada de tiempo para intervalos de configuración
   */
  async handleTimeInput(ctx: BotContext, timeValue: string): Promise<void> {
    const state = this.stateManager.getUserState(ctx.from.id);

    if (!state || state.action !== 'SET_TIME_INTERVAL') {
      return;
    }

    try {
      // Parsear el tiempo con el nuevo formato
      const parsed = parseTimeString(timeValue);
      const description = getTimeDescription(parsed);

      let responseMsg: any;

      switch (state.settingType) {
        case 'PUBLISH_INTERVAL':
          await this.configManager.setPublishInterval(
            parsed.seconds,
            ctx.from.id.toString(),
          );
          responseMsg = await ctx.reply(
            `✅ Intervalo de publicación actualizado a ${description}`,
          );
          break;

        case 'SYNC_INTERVAL':
          await this.configManager.setSyncGroupsInterval(
            parsed.seconds,
            ctx.from.id.toString(),
          );
          responseMsg = await ctx.reply(
            `✅ Intervalo de sync actualizado a ${description}`,
          );
          break;

        case 'CONFIG_REFRESH_INTERVAL':
          await this.configManager.setConfigRefreshInterval(
            parsed.seconds,
            ctx.from.id.toString(),
          );
          responseMsg = await ctx.reply(
            `✅ Intervalo de refresh actualizado a ${description}`,
          );
          break;
      }

      // Eliminar todos los mensajes después de 5 segundos
      if (responseMsg) {
        this.botMessage.deleteAfterDelay(ctx, responseMsg.message_id, 5 * 1000);
      }
      this.botMessage.deleteAfterDelay(ctx, ctx.message.message_id, 5 * 1000);
      if (state.requestMessageId) {
        this.botMessage.deleteAfterDelay(ctx, state.requestMessageId, 5 * 1000);
      }

      // Limpiar estado del usuario
      this.stateManager.clearUserState(ctx.from.id);
    } catch (error: any) {
      const errorMsg = await ctx.reply(`❌ ${error.message}`);
      this.botMessage.deleteAfterDelay(ctx, errorMsg.message_id, 5 * 1000);
      this.botMessage.deleteAfterDelay(ctx, ctx.message.message_id, 5 * 1000);
      if (state.requestMessageId) {
        this.botMessage.deleteAfterDelay(ctx, state.requestMessageId, 5 * 1000);
      }
      this.stateManager.clearUserState(ctx.from.id);
    }
  }
}
