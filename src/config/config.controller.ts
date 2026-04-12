import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ConfigService, UpdateConfigDto } from './config.service';

/**
 * Controlador para gestionar la configuración de la aplicación.
 *
 * Endpoints:
 * - GET /config - Obtiene la configuración actual
 * - PATCH /config - Actualiza la configuración
 * - POST /config/reset - Resetea a valores por defecto
 * - PATCH /config/publish - Toggle publicación
 * - PATCH /config/sync-groups - Toggle sincronización de grupos
 * - PATCH /config/deliveries - Toggle domicilios
 * - PATCH /config/messengers - Toggle recomendación de mensajeros
 * - PATCH /config/ai - Toggle conversación con IA
 */
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Obtiene la configuración actual
   */
  @Get()
  async getConfig() {
    return this.configService.getConfig();
  }

  /**
   * Actualiza múltiples campos de configuración
   */
  @Patch()
  async updateConfig(@Body() dto: UpdateConfigDto) {
    return this.configService.updateConfig(dto);
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  @Post('reset')
  async resetConfig() {
    return this.configService.resetConfig();
  }

  /**
   * Toggle: Habilita/deshabilita publicación
   */
  @Patch('publish')
  async togglePublish(@Body() body: { enabled: boolean }) {
    return this.configService.togglePublish(body.enabled);
  }

  /**
   * Toggle: Habilita/deshabilita sincronización de grupos de Telegram
   */
  @Patch('sync-groups')
  async toggleSyncGroups(@Body() body: { enabled: boolean }) {
    return this.configService.toggleSyncGroups(body.enabled);
  }

  /**
   * Toggle: Habilita/deshabilita sincronización de grupos de WhatsApp
   */
  @Patch('sync-whatsapp-groups')
  async toggleSyncWhatsappGroups(@Body() body: { enabled: boolean }) {
    return this.configService.toggleSyncWhatsappGroups(body.enabled);
  }

  /**
   * Toggle: Habilita/deshabilita domicilios
   */
  @Patch('deliveries')
  async toggleDeliveries(@Body() body: { enabled: boolean }) {
    return this.configService.toggleDeliveries(body.enabled);
  }

  /**
   * Toggle: Habilita/deshabilita recomendación de mensajeros
   */
  @Patch('messengers')
  async toggleMessengersRecommendation(@Body() body: { enabled: boolean }) {
    return this.configService.toggleMessengersRecommendation(body.enabled);
  }

  /**
   * Toggle: Habilita/deshabilita conversación con IA
   */
  @Patch('ai')
  async toggleConversationWithAI(@Body() body: { enabled: boolean }) {
    return this.configService.toggleConversationWithAI(body.enabled);
  }

  /**
   * Actualiza el intervalo de publicación (en segundos)
   */
  @Patch('publish-interval')
  async setPublishInterval(@Body() body: { seconds: number }) {
    return this.configService.setPublishInterval(body.seconds);
  }

  /**
   * Actualiza el intervalo de sincronización de grupos (en segundos)
   */
  @Patch('sync-groups-interval')
  async setSyncGroupsInterval(@Body() body: { seconds: number }) {
    return this.configService.setSyncGroupsInterval(body.seconds);
  }

  /**
   * Actualiza el intervalo de refresh de configuración (en segundos)
   */
  @Patch('config-refresh-interval')
  async setConfigRefreshInterval(@Body() body: { seconds: number }) {
    return this.configService.setConfigRefreshInterval(body.seconds);
  }
}
