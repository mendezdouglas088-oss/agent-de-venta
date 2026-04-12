import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from 'src/config/config.service';
import { WhatsappConnectService } from './whatsapp-connect.service';
import { WhatsappService } from './whatsapp.service';

/**
 * Sincroniza grupos de WhatsApp para TODOS los usuarios conectados.
 * Itera sobre las sesiones activas y actualiza la BD de cada usuario.
 */
@Injectable()
export class WhatsappScheduler {
  private readonly logger = new Logger(WhatsappScheduler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappConnectService: WhatsappConnectService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleWhatsappGroupsSync() {
    try {
      const config = await this.configService.getConfig();
      if (!config.syncWhatsappGroupsEnable) return;

      // Obtener todos los usuarios con sesión activa de WhatsApp
      const connectedIds =
        this.whatsappConnectService.getAllConnectedTelegramIds();

      if (connectedIds.length === 0) {
        this.logger.debug(
          '⏸️ Ningún usuario de WhatsApp conectado, saltando sync...',
        );
        return;
      }

      this.logger.log(
        `🔄 Sincronizando grupos de ${connectedIds.length} usuario(s)...`,
      );

      for (const telegramId of connectedIds) {
        try {
          const groups =
            await this.whatsappConnectService.getGroups(telegramId);
          if ('error' in groups) {
            this.logger.error(
              `❌ Error obteniendo grupos para ${telegramId}: ${groups.error}`,
            );
            continue;
          }
          await this.whatsappService.create(groups, telegramId);
          this.logger.log(
            `✅ ${groups.length} grupos sync para usuario ${telegramId}`,
          );
        } catch (err) {
          this.logger.error(
            `❌ Error sync usuario ${telegramId}: ${err.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        '❌ Error en sync de grupos de WhatsApp:',
        error.message,
      );
    }
  }
}
