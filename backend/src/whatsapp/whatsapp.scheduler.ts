import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from 'src/config/config.service';
import {
  WHATSAPP_PROVIDER,
  WhatsappGroupInterface,
  WhatsappProvider,
} from './domain/whatsapp-provider.interface';
import { UsersService } from 'src/users/users.service';
import { WhatsappGroupService } from './whatsapp-group.service';

/**
 * Sincroniza grupos de WhatsApp para TODOS los usuarios conectados.
 * Itera sobre las sesiones activas y actualiza la BD de cada usuario.
 */
@Injectable()
export class WhatsappScheduler {
  private readonly logger = new Logger(WhatsappScheduler.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly whatsappGroupService: WhatsappGroupService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleWhatsappGroupsSync() {
    try {
      const config = await this.configService.getConfig();
      if (!config.syncWhatsappGroupsEnable) return;

      // Obtener todos los usuarios con sesión activa de WhatsApp
      const connectedIds = this.provider.getAllConnectedSessionIds();

      if (connectedIds.length === 0) {
        this.logger.debug(
          '⏸️ Ningún usuario de WhatsApp conectado, saltando sync...',
        );
        return;
      }

      this.logger.log(
        `🔄 Sincronizando grupos de ${connectedIds.length} usuario(s)...`,
      );

      for (const sessionId of connectedIds) {
        try {
          const groups = await this.provider.getGroups(sessionId);
          if ('error' in groups) {
            this.logger.error(
              `❌ Error obteniendo grupos para ${sessionId}: ${groups.error}`,
            );
            continue;
          }
          const groupNewData: WhatsappGroupInterface[] = groups.map((g) => ({
            whatsappGroupId: g.whatsappGroupId,
            title: g.title,
          }));
          await this.whatsappGroupService.create(groupNewData, sessionId);
          this.logger.log(
            `✅ ${groups.length} grupos sync para usuario ${sessionId}`,
          );
        } catch (err) {
          this.logger.error(
            `❌ Error sync usuario ${sessionId}: ${err.message}`,
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
