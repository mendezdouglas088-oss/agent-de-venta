import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserbotClientService } from './userbot-client.service';
import { GroupsSyncScheduler } from './schedulers/groups-sync.scheduler';

/**
 * Controlador HTTP del userbot.
 *
 * Expone endpoints para:
 *  - Autenticar el userbot con Telegram (primera vez)
 *  - Ver el estado de conexión
 *  - Disparar sync manual de grupos
 */
@Controller('userbot')
export class UserbotController {
  constructor(
    private readonly userbotClient: UserbotClientService,
    private readonly groupsSync: GroupsSyncScheduler,
  ) {}

  /**
   * GET /userbot/status
   * Retorna el estado de conexión del userbot.
   */
  @Get('status')
  getStatus() {
    return this.userbotClient.getStatus();
  }

  /**
   * POST /userbot/auth/start
   * Inicia el flujo de autenticación.
   * Telegram enviará un código SMS al TELEGRAM_PHONE_NUMBER.
   */
  @Post('auth/start')
  async startAuth() {
    return this.userbotClient.startAuth();
  }

  /**
   * POST /userbot/auth/code
   * Completa la autenticación con el código recibido por SMS.
   *
   * Body: { "code": "12345" }
   */
  @Post('auth/code')
  submitCode(@Body() body: { code: string }) {
    return this.userbotClient.submitCode(body.code);
  }

  /**
   * POST /userbot/sync-groups
   * Dispara una sincronización manual de grupos.
   * Útil para forzar actualización sin esperar el intervalo automático.
   */
  @Post('sync-groups')
  async syncGroups() {
    return this.groupsSync.triggerSync();
  }
}
