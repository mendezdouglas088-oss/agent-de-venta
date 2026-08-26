import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from 'src/database/entities/config.entity';

export interface UpdateConfigDto {
  publishEnabled?: boolean;
  publishInterval?: number;
  syncGroupsEnable?: boolean;
  syncWhatsappGroupsEnable?: boolean;
  deliveriesEnable?: boolean;
  recommendMessengersEnable?: boolean;
  conversationWithAI?: boolean;
  syncGroupsTimeInterval?: number;
  configRefreshInterval?: number;
}

const DEFAULT_CONFIG = {
  publishEnabled: true,
  publishInterval: 600,
  syncGroupsEnable: false,
  syncWhatsappGroupsEnable: false,
  deliveriesEnable: false,
  recommendMessengersEnable: false,
  conversationWithAI: true,
  syncGroupsTimeInterval: 60 * 60 * 24 * 7,
  configRefreshInterval: 10,
};

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  /**
   * Obtiene la configuración del usuario. Si no existe, la crea con valores por defecto.
   * Si no se pasa userId, retorna la config global (userId IS NULL).
   */
  async getConfig(userId?: string): Promise<Config> {
    const where = userId ? { userId } : { userId: null as any };
    let config = await this.configRepository.findOne({ where });

    if (!config) {
      config = this.configRepository.create({ ...DEFAULT_CONFIG, userId: userId ?? null });
      await this.configRepository.save(config);
    }

    return config;
  }

  /**
   * Actualiza la configuración del usuario.
   */
  async updateConfig(dto: UpdateConfigDto, userId?: string): Promise<Config> {
    const config = await this.getConfig(userId);
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  async updateField(field: keyof Config, value: unknown, userId?: string): Promise<Config> {
    const config = await this.getConfig(userId);
    (config as any)[field] = value;
    return this.configRepository.save(config);
  }

  async resetConfig(userId?: string): Promise<Config> {
    const config = await this.getConfig(userId);
    Object.assign(config, DEFAULT_CONFIG);
    return this.configRepository.save(config);
  }

  async togglePublish(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('publishEnabled', enabled, userId);
  }

  async toggleSyncGroups(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('syncGroupsEnable', enabled, userId);
  }

  async toggleSyncWhatsappGroups(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('syncWhatsappGroupsEnable', enabled, userId);
  }

  async toggleDeliveries(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('deliveriesEnable', enabled, userId);
  }

  async toggleMessengersRecommendation(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('recommendMessengersEnable', enabled, userId);
  }

  async toggleConversationWithAI(enabled: boolean, userId?: string): Promise<Config> {
    return this.updateField('conversationWithAI', enabled, userId);
  }

  async setPublishInterval(seconds: number, userId?: string): Promise<Config> {
    if (seconds <= 0) throw new Error('El intervalo debe ser mayor a 0 segundos');
    return this.updateField('publishInterval', seconds, userId);
  }

  async setSyncGroupsInterval(seconds: number, userId?: string): Promise<Config> {
    if (seconds <= 0) throw new Error('El intervalo debe ser mayor a 0 segundos');
    return this.updateField('syncGroupsTimeInterval', seconds, userId);
  }

  async setConfigRefreshInterval(seconds: number, userId?: string): Promise<Config> {
    if (seconds <= 0) throw new Error('El intervalo debe ser mayor a 0 segundos');
    return this.updateField('configRefreshInterval', seconds, userId);
  }

  /** Configs de todos los usuarios con publicación activa (para el scheduler) */
  async getAllActivePublishConfigs(): Promise<Config[]> {
    return this.configRepository.find({ where: { publishEnabled: true } });
  }

  /** Configs de todos los usuarios con sync WhatsApp activo */
  async getAllActiveSyncWhatsappConfigs(): Promise<Config[]> {
    return this.configRepository.find({ where: { syncWhatsappGroupsEnable: true } });
  }
}
