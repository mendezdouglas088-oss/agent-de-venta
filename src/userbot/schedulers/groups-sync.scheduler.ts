import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { UserbotClientService } from '../userbot-client.service';
import { TelegramGroupsService } from 'src/telegram-group/telegram-group.service';
import { ConfigService } from 'src/config/config.service';

/**
 * Scheduler que sincroniza los grupos de Telegram con la base de datos.
 *
 * Equivalente a: src/schedulers/get_all_groups_schedulers.py (Python)
 *
 * Proceso por cada ciclo:
 *  1. Itera todos los diálogos del userbot (iter_dialogs)
 *  2. Filtra solo megagrupos (supergrupos)
 *  3. Obtiene los miembros de cada grupo (iter_participants)
 *  4. Guarda/actualiza en la BD via TelegramGroupsService.syncGroups()
 *
 * Condiciones para ejecutar:
 *  - config.syncGroupsEnable === true
 *  - El userbot esté conectado
 */
@Injectable()
export class GroupsSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GroupsSyncScheduler.name);
  private intervalHandle: NodeJS.Timeout | null = null;

  /** Check cada 60 segundos si es momento de sincronizar */
  private readonly CHECK_INTERVAL_MS = 60_000;
  private lastSyncAt: Date | null = null;

  constructor(
    private readonly userbotClient: UserbotClientService,
    private readonly telegramGroupsService: TelegramGroupsService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.logger.log('📡 GroupsSyncScheduler iniciado (check cada 60 s)');
    this.intervalHandle = setInterval(
      () => this.tick(),
      this.CHECK_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }

  // ─────────────────────────────────────────────
  // TICK
  // ─────────────────────────────────────────────

  private async tick(): Promise<void> {
    try {
      const config = await this.configService.getConfig();

      if (!config.syncGroupsEnable) return;

      if (!this.userbotClient.isConnected()) {
        this.logger.debug('⏸️ Userbot no conectado, saltando sync de grupos');
        return;
      }

      const intervalMs = (config.syncGroupsTimeInterval || 604800) * 1_000;
      const now = new Date();

      if (
        this.lastSyncAt &&
        now.getTime() - this.lastSyncAt.getTime() < intervalMs
      ) {
        return;
      }

      this.logger.log('📡 Iniciando sincronización de grupos de Telegram...');
      this.lastSyncAt = now;
      await this._syncGroups();
    } catch (err: any) {
      this.logger.error('❌ Error en sync de grupos:', err?.message);
    }
  }

  // ─────────────────────────────────────────────
  // SINCRONIZACIÓN
  // ─────────────────────────────────────────────

  private async _syncGroups(): Promise<void> {
    const client = this.userbotClient.getClient();
    if (!client) return;

    let total = 0;

    try {
      // Iterar todos los diálogos del userbot
      for await (const dialog of client.iterDialogs({})) {
        // Solo megagrupos (supergrupos de Telegram)
        if (!dialog.isGroup) continue;

        const entity = dialog.entity as any;
        // En GramJS, megagroups tienen entity.megagroup === true
        if (!entity?.megagroup) continue;

        const groupData = {
          title: entity.title as string,
          id: Number(entity.id),
          members: [] as { username: string; telegramUserId: number }[],
        };

        // Obtener miembros del grupo
        try {
          for await (const participant of client.iterParticipants(entity)) {
            groupData.members.push({
              username: (participant as any).username || '',
              // GramJS usa BigInt para IDs — convertir a number
              telegramUserId: Number((participant as any).id),
            });
          }
          this.logger.debug(
            `✅ "${entity.title}": ${groupData.members.length} miembros`,
          );
        } catch (err: any) {
          this.logger.warn(
            `⚠️ No se pudieron obtener miembros de "${entity.title}": ${err?.message}`,
          );
        }

        await this.telegramGroupsService.syncGroups(groupData);
        total++;
      }

      this.logger.log(`✅ Sync completado: ${total} grupos procesados`);
    } catch (err: any) {
      this.logger.error('❌ Error iterando diálogos:', err?.message);
    }
  }

  // ─────────────────────────────────────────────
  // TRIGGER MANUAL (para el bot admin)
  // ─────────────────────────────────────────────

  async triggerSync(): Promise<{ ok: boolean; message: string }> {
    if (!this.userbotClient.isConnected()) {
      return { ok: false, message: 'Userbot no conectado' };
    }
    this.lastSyncAt = null; // Forzar ejecución en el próximo tick
    this.logger.log('🔄 Sync manual de grupos solicitado');
    await this._syncGroups();
    return { ok: true, message: 'Sync completado' };
  }
}
