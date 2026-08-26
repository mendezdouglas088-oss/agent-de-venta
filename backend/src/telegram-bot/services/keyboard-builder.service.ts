import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { MENU_OPTIONS } from '../constants';

type InlineButton = ReturnType<typeof Markup.button.callback>;

/**
 * Servicio para construir teclados inline de Telegram.
 *
 * Principio S: Solo se encarga de construir teclados.
 * Principio O: Fácil de extender con nuevos métodos sin modificar existentes.
 */
@Injectable()
export class KeyboardBuilderService {
  /**
   * Teclado del menú principal
   */
  buildMainMenu(
    isAdmin: boolean = false,
    isSuperAdmin: boolean = false,
    pendingTransfers: number = 0,
  ) {
    const rows: ReturnType<typeof Markup.button.callback>[][] = [
      [
        Markup.button.callback(
          MENU_OPTIONS.PRODUCTS.nameItem,
          MENU_OPTIONS.PRODUCTS.list,
        ),
      ],
      [
        Markup.button.callback(
          MENU_OPTIONS.GROUPS.nameItem,
          MENU_OPTIONS.GROUPS.nameGeneral,
        ),
      ],
      [
        Markup.button.callback(
          MENU_OPTIONS.PUBLICATIONS.nameItem,
          MENU_OPTIONS.PUBLICATIONS.list,
        ),
      ],
      // [
      //   Markup.button.callback(
      //     MENU_OPTIONS.MESSENGERS.nameItem,
      //     MENU_OPTIONS.MESSENGERS.nameGeneral,
      //   ),
      // ],
    ];

    if (isAdmin) {
      rows.push([
        Markup.button.callback('👥 Usuarios', MENU_OPTIONS.ADMIN.users),
      ]);

      //💸 *Transferencias
    } else {
      rows.push([
        Markup.button.callback(
          MENU_OPTIONS.PLAN.nameItem,
          MENU_OPTIONS.PLAN.nameGeneral,
        ),
      ]);
    }

    if (isAdmin) {
      rows.push([
        Markup.button.callback(
          pendingTransfers > 0
            ? `💸 Transferencias (${pendingTransfers})`
            : MENU_OPTIONS.TRANSFERS.nameItem,
          MENU_OPTIONS.TRANSFERS.nameGeneral,
        ),
      ]);
    }

    rows.push([Markup.button.callback('📊 Estadísticas', MENU_OPTIONS.STATS)]);

    rows.push([
      Markup.button.callback('⚙️ Configuración', MENU_OPTIONS.SETTINGS),
    ]);

    return {
      text: isSuperAdmin
        ? '🛠 Menu Principal *(Super Admin)*'
        : isAdmin
          ? '🛠 Menu Principal *(Admin)*'
          : '🛠 Menu Principal',
      options: {
        parse_mode: 'Markdown' as const,
        ...Markup.inlineKeyboard(rows),
      },
    };
  }

  /**
   * Botón de volver al home
   */
  buildBackToHomeButton(): InlineButton[] {
    return [
      Markup.button.callback(
        MENU_OPTIONS.HOME.nameItem,
        MENU_OPTIONS.HOME.nameGeneral,
      ),
    ];
  }

  /**
   * Botón de volver atrás genérico
   */
  buildBackButton(action: string, label = '⬆️ Atrás'): InlineButton[] {
    return [Markup.button.callback(label, action)];
  }

  /**
   * Divide botones en filas de N elementos
   */
  chunkButtons(buttons: InlineButton[], chunkSize = 5): InlineButton[][] {
    const result: InlineButton[][] = [];
    for (let i = 0; i < buttons.length; i += chunkSize) {
      result.push(buttons.slice(i, i + chunkSize));
    }
    return result;
  }

  /**
   * Construye botones de paginación
   */
  buildPaginationButtons(
    currentPage: number,
    totalItems: number,
    pageSize: number,
    callbackPrefix: string,
    showSearch = false,
  ): InlineButton[] {
    const buttons: InlineButton[] = [];
    const hasMore = currentPage * pageSize < totalItems;

    if (currentPage > 1) {
      buttons.push(
        Markup.button.callback(
          '⬅️ Anterior',
          `${callbackPrefix}_PAGE_${currentPage - 1}`,
        ),
      );
    }

    if (showSearch && (currentPage > 1 || hasMore)) {
      buttons.push(Markup.button.callback('🔎 Buscar', 'SEARCH_ITEMS'));
    }

    if (hasMore) {
      buttons.push(
        Markup.button.callback(
          '➡️ Siguiente',
          `${callbackPrefix}_PAGE_${currentPage + 1}`,
        ),
      );
    }

    return buttons;
  }

  /**
   * Construye teclado para gestión de productos
   */
  buildProductManagementKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('➕ Añadir producto', 'ADD_PRODUCT'),
        Markup.button.callback(
          '📋 Listar productos',
          MENU_OPTIONS.PRODUCTS.list,
        ),
      ],
      [],
      this.buildBackButton(MENU_OPTIONS.HOME.nameGeneral),
    ]);
  }

  /**
   * Construye teclado para gestión de mensajeros
   */
  buildMessengerManagementKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('➕ Añadir mensajero', 'ADD_MESSENGER'),
        Markup.button.callback(
          '📋 Listar mensajeros',
          MENU_OPTIONS.MESSENGERS.list,
        ),
      ],
      [],
      this.buildBackButton(MENU_OPTIONS.HOME.nameGeneral),
    ]);
  }

  /**
   * Construye teclado de configuración
   */
  buildSettingsKeyboard(
    iaActive: boolean,
    messagingActive: boolean,
    deliveryActive: boolean,
    syncActive: boolean,
    syncWhatsappActive: boolean,
    publishActive: boolean,
    whatsappConnected: boolean = false,
    telegramConnected: boolean = false,
  ) {
    const iaLabel = iaActive
      ? '✅ Conversación con IA'
      : '❌ Conversación con IA';
    const msgLabel = messagingActive
      ? '✅ Recomendación de mensajeros'
      : '❌ Recomendación de mensajeros';
    const deliveryLabel = deliveryActive ? '✅ Domicilios' : '❌ Domicilios';
    const syncLabel = syncActive
      ? '✅ Sync Telegram Groups'
      : '❌ Sync Telegram Groups';
    const syncWhatsappLabel = syncWhatsappActive
      ? '✅ Sync Whatsapp Groups'
      : '❌ Sync Whatsapp Groups';
    const publishLabel = publishActive
      ? '✅ Publicacion de Producto'
      : '❌ Publicacion de Producto';
    const waLabel = whatsappConnected
      ? '✅ Connect WhatsApp'
      : '❌ Connect WhatsApp';
    const tgLabel = telegramConnected
      ? '✅ Connect Telegram'
      : '❌ Connect Telegram';

    return Markup.inlineKeyboard([
      [Markup.button.callback(iaLabel, 'SETTINGS_OPTIONS_1')],
      [Markup.button.callback(msgLabel, 'SETTINGS_OPTIONS_2')],
      [Markup.button.callback(deliveryLabel, 'SETTINGS_OPTIONS_3')],
      [Markup.button.callback(syncLabel, 'SETTINGS_OPTIONS_4')],
      [Markup.button.callback(syncWhatsappLabel, 'SETTINGS_OPTIONS_10')],

      [Markup.button.callback(publishLabel, 'SETTINGS_OPTIONS_5')],
      [Markup.button.callback('Tiempo para Publicar', 'SETTINGS_OPTIONS_6')],
      [Markup.button.callback('Tiempo para Sync', 'SETTINGS_OPTIONS_7')],
      [Markup.button.callback('Tiempo para Config', 'SETTINGS_OPTIONS_8')],

      [
        Markup.button.callback(
          'Estado de la Configuración',
          'SETTINGS_OPTIONS_9',
        ),
      ],
      [Markup.button.callback(waLabel, 'CONFIG_CONNECT_WHATSAPP')],
      [Markup.button.callback(tgLabel, 'CONFIG_CONNECT_TELEGRAM')],
      this.buildBackButton(MENU_OPTIONS.HOME.nameGeneral),
    ]);
  }

  /**
   * Construye teclado de configuración con estado actual
   */
  buildConfigKeyboard(
    status: any,
    whatsappConnected: boolean = false,
    telegramConnected: boolean = false,
  ) {
    const waIcon = whatsappConnected ? '✅' : '❌';
    const tgIcon = telegramConnected ? '✅' : '❌';

    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `${status.publish} Publicación`,
          'CONFIG_TOGGLE_PUBLISH',
        ),
      ],
      [
        Markup.button.callback(
          `${status.syncGroups} Sync Grupos Telegram`,
          'CONFIG_TOGGLE_SYNC_GROUPS',
        ),
      ],
      [
        Markup.button.callback(
          `${status.syncWhatsappGroups} Sync Grupos WhatsApp`,
          'CONFIG_TOGGLE_SYNC_WHATSAPP',
        ),
      ],
      [
        Markup.button.callback(
          `${status.deliveries} Domicilios`,
          'CONFIG_TOGGLE_DELIVERIES',
        ),
      ],
      [
        Markup.button.callback(
          `${status.messengers} Mensajeros`,
          'CONFIG_TOGGLE_MESSENGERS',
        ),
      ],
      [
        Markup.button.callback(
          `${status.ai} Conversación IA`,
          'CONFIG_TOGGLE_AI',
        ),
      ],
      [
        Markup.button.callback(
          `${waIcon} Connect WhatsApp`,
          'CONFIG_CONNECT_WHATSAPP',
        ),
      ],
      [
        Markup.button.callback(
          `${tgIcon} Connect Telegram`,
          'CONFIG_CONNECT_TELEGRAM',
        ),
      ],
      [Markup.button.callback('🔄 Resetear', 'CONFIG_RESET')],
      this.buildBackButton(MENU_OPTIONS.HOME.nameGeneral),
    ]);
  }
}
