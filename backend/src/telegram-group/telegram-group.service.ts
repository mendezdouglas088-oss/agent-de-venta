import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramGroup } from 'src/database/entities/telegram-group.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramGroupsService {
  constructor(
    @InjectRepository(TelegramGroup)
    private readonly repo: Repository<TelegramGroup>,
  ) {}

  async syncGroups(
    group: {
      title: string;
      id: number;
      members: { username: string; telegramUserId: number }[];
    },
    userId?: string,
  ) {
    try {
      const existing = await this.repo.findOne({
        where: { telegramGroupId: group.id },
      });

      if (!existing) {
        await this.repo.save({
          telegramGroupId: group.id,
          title: group.title,
          publishEnabled: false,
          members: group.members,
          userId: userId ?? null,
        });
        return { created: 1, updated: 0 };
      }

      const titleChanged = existing.title !== group.title;
      const membersChanged =
        JSON.stringify(existing.members) !== JSON.stringify(group.members);

      if (titleChanged || membersChanged) {
        existing.title = group.title;
        existing.members = group.members;
        await this.repo.save(existing);
        return { created: 0, updated: 1 };
      }

      return { created: 0, updated: 0 };
    } catch (error) {
      console.error('Error syncing group:', error);
      throw error;
    }
  }

  async getPublishableGroups(userId?: string) {
    const where: any = { publishEnabled: true };
    if (userId) where.userId = userId;
    return this.repo.find({ where });
  }

  /** Lista todos los grupos. Si se pasa userId, filtra por usuario. */
  async findall(userId?: string) {
    if (userId) return this.repo.find({ where: { userId } });
    return this.repo.find();
  }

  async findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async save(group: TelegramGroup) {
    return this.repo.save(group);
  }
}
