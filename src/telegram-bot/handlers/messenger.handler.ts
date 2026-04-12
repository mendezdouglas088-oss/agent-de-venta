import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { BotContext } from '../interfaces';
import { PaginationService } from '../services/pagination.service';
import { KeyboardBuilderService } from '../services/keyboard-builder.service';
import { CALLBACK_PREFIXES, MENU_OPTIONS } from '../constants';

/**
 * Interfaz temporal para mensajeros (mock data).
 * TODO: Crear entidad y servicio real cuando se implemente.
 */
interface Messenger {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  active: boolean;
}

/**
 * Handler para operaciones de mensajeros.
 *
 * Principio S: Solo maneja lógica de mensajeros.
 *
 * TODO: Actualmente usa datos mock. Implementar MessengersService
 * cuando se cree la entidad en la base de datos.
 */
@Injectable()
export class MessengerHandler {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly keyboardBuilder: KeyboardBuilderService,
  ) {}

  // Datos mock - TODO: mover a MessengersService
  private readonly messengers: Messenger[] = Array.from(
    { length: 30 },
    (_, i) => ({
      id: i + 1,
      name: `Mensajero ${i + 1}`,
      phone: `+57${Math.floor(Math.random() * 900000000 + 100000000)}`,
      vehicle: ['Moto', 'Bicicleta', 'Carro'][Math.floor(Math.random() * 3)],
      active: Math.random() > 0.2,
    }),
  );

  /**
   * Lista mensajeros con paginación
   */
  async list(ctx: BotContext, page = 1): Promise<void> {
    await ctx.answerCbQuery('🚴 Listando mensajeros...');

    await this.paginationService.showPage({
      ctx,
      items: this.messengers,
      page,
      getText: (item, index) =>
        `✅ ${index + 1}. *${item.name}* - 📞 ${item.phone}`,
      getId: (item) => item.id,
      callbackPrefix: CALLBACK_PREFIXES.MESSENGER_SELECT,
      backAction: MENU_OPTIONS.MESSENGERS.nameGeneral,
      showSearch: true,
    });
  }

  /**
   * Muestra detalles de un mensajero seleccionado
   */
  async select(ctx: BotContext, callbackData: string): Promise<void> {
    const messengerId = Number(callbackData.split('_').pop());
    const numberPage = Math.ceil(messengerId / 10);

    const messenger = this.messengers.find((m) => m.id === messengerId);

    if (!messenger) {
      await ctx.answerCbQuery('❌ Mensajero no encontrado');
      return;
    }

    await ctx.editMessageText(
      `✅ *Mensajero seleccionado*\n\n🚴 *${messenger.name}*\n📞 Teléfono: ${messenger.phone}\n🚗 Vehículo: ${messenger.vehicle}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '🗑 Eliminar',
              `DELETE_MESSENGER_${messenger.id}`,
            ),
            Markup.button.callback(
              '✏️ Editar',
              `EDIT_MESSENGER_${messenger.id}`,
            ),
          ],
          [Markup.button.callback('🛒 Carrito', MENU_OPTIONS.CARRITO)],
          [
            Markup.button.callback(
              '⬆️ Atrás',
              `MESSENGER_SELECT_PAGE_${numberPage}`,
            ),
          ],
          this.keyboardBuilder.buildBackToHomeButton(),
        ]),
      },
    );

    await ctx.answerCbQuery();
  }

  /**
   * Muestra menú de gestión de mensajeros
   */
  async showManagement(ctx: BotContext): Promise<void> {
    await ctx.editMessageText(
      '🚴 Gestión de mensajeros',
      this.keyboardBuilder.buildMessengerManagementKeyboard(),
    );
  }

  /**
   * Obtiene el total de mensajeros (para estadísticas)
   */
  getTotal(): number {
    return this.messengers.length;
  }
}
