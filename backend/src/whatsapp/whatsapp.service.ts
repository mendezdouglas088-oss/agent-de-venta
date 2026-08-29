import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { WhatsappGroupInterface } from './domain/whatsapp-provider.interface';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectRepository(WhatsappGroup)
    private repo: Repository<WhatsappGroup>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sincroniza grupos de WhatsApp en BD.
   * @param listGroups Lista de grupos obtenidos de whatsapp-web.js
   * @param telegramId telegramId del usuario dueño (se convierte a UUID internamente)
   */
  async create(groups: WhatsappGroupInterface[], userId?: string | null) {
    for (const group of groups) {
      await this.repo.upsert(
        {
          whatsappGroupId: group.whatsappGroupId,
          title: group.title,
          userId: userId ?? null,
        },
        {
          conflictPaths: ['whatsappGroupId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    }
  }

  /** Lista grupos. Si se pasa userId (UUID), filtra por usuario. */
  async findAll(userId?: string) {
    if (userId) return await this.repo.find({ where: { userId } });
    return await this.repo.find();
  }

  /**
   * Lista grupos por telegramId (convierte a UUID antes de filtrar).
   */
  async findAllByTelegramId(telegramId: string) {
    const user = await this.usersService.findByTelegramId(telegramId);
    if (!user) return [];
    return await this.repo.find({ where: { userId: user.id } });
  }

  async findById(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  reconstructFullId(numericId: string): string {
    return numericId.includes('@') ? numericId : `${numericId}@g.us`;
  }

  async findOne(whatsappGroupId: string) {
    return await this.repo.findOne({ where: { whatsappGroupId } });
  }

  async findByNumericId(numericId: string) {
    const groups = await this.repo.find();
    return groups.find((g) => g.whatsappGroupId.split('@')[0] === numericId);
  }

  async updatePublish(whatsappGroupId: string) {
    const group = await this.repo.findOne({ where: { whatsappGroupId } });
    if (!group) return null;
    group.publishEnabled = !group.publishEnabled;
    return await this.repo.save(group);
  }
}
