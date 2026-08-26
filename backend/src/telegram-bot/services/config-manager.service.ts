import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { UsersService } from 'src/users/users.service';

/**
 * Servicio intermediario entre el bot y ConfigService.
 * Resuelve telegramId → userId (UUID) antes de cada operación.
 */
@Injectable()
export class ConfigManagerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /** Resuelve el telegramId al UUID interno del usuario */
  private async resolveUserId(telegramId: string): Promise<string | undefined> {
    if (!telegramId) return undefined;
    const user = await this.usersService.findByTelegramId(telegramId);
    return user?.id;
  }

  async getConfig(telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.getConfig(userId);
  }

  async togglePublish(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.togglePublish(enabled, userId);
  }

  async toggleSyncGroups(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.toggleSyncGroups(enabled, userId);
  }

  async toggleSyncWhatsappGroups(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.toggleSyncWhatsappGroups(enabled, userId);
  }

  async toggleDeliveries(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.toggleDeliveries(enabled, userId);
  }

  async toggleMessengers(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.toggleMessengersRecommendation(enabled, userId);
  }

  async toggleAI(enabled: boolean, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.toggleConversationWithAI(enabled, userId);
  }

  async setPublishInterval(seconds: number, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.setPublishInterval(seconds, userId);
  }

  async setSyncGroupsInterval(seconds: number, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.setSyncGroupsInterval(seconds, userId);
  }

  async setConfigRefreshInterval(seconds: number, telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.setConfigRefreshInterval(seconds, userId);
  }

  async resetConfig(telegramId: string) {
    const userId = await this.resolveUserId(telegramId);
    return this.configService.resetConfig(userId);
  }

  async getFormattedStatus(telegramId: string) {
    const config = await this.getConfig(telegramId);
    return {
      publish: config.publishEnabled ? '✅' : '❌',
      syncGroups: config.syncGroupsEnable ? '✅' : '❌',
      syncWhatsappGroups: config.syncWhatsappGroupsEnable ? '✅' : '❌',
      deliveries: config.deliveriesEnable ? '✅' : '❌',
      messengers: config.recommendMessengersEnable ? '✅' : '❌',
      ai: config.conversationWithAI ? '✅' : '❌',
      publishInterval: config.publishInterval,
      syncInterval: config.syncGroupsTimeInterval,
      configRefreshInterval: config.configRefreshInterval,
    };
  }
}
