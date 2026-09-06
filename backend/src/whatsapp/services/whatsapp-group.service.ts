import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { WhatsappGroupInterface } from '../domain/whatsapp-provider.interface';
import { WhatsappConnectionsService } from './whatsapp-connections.service';

@Injectable()
export class WhatsappGroupService {
  constructor(
    @InjectRepository(WhatsappGroup)
    private repoWhatsappGroup: Repository<WhatsappGroup>,
    private readonly whatsappConnectionsService: WhatsappConnectionsService, // sin @InjectRepository
    private readonly usersService: UsersService,
  ) {}

  async create(groups: WhatsappGroupInterface[], sessionId?: string | null) {
    let whatsappConnectionId: string | null = null;
    if (sessionId) {
      const connection =
        await this.whatsappConnectionsService.findByConnectionId(sessionId);
      whatsappConnectionId = connection?.id ?? null;
    }

    for (const group of groups) {
      await this.repoWhatsappGroup.upsert(
        {
          whatsappGroupId: group.whatsappGroupId,
          title: group.title,
          lastMessage: group.lastMessage,
          lastMessageAt: group.lastMessageAt,
          unreadCount: group.unreadCount ?? 0,
          participantsCount: group.participantsCount,
          whatsappConnectionId,
        },
        {
          conflictPaths: ['whatsappGroupId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    }
  }

  async findAllById(userId: string, whatConnectionId?: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) return [];
    if (!whatConnectionId) {
      return await this.repoWhatsappGroup.find({
        where: { whatsappConnection: { userId } },
      });
    }
    return await this.repoWhatsappGroup.find({
      where: {
        whatsappConnectionId: whatConnectionId,
        whatsappConnection: { userId },
      },
    });
  }

  async findAll() {
    return await this.repoWhatsappGroup.find();
  }

  reconstructFullId(numericId: string): string {
    return numericId.includes('@') ? numericId : `${numericId}@g.us`;
  }

  async findOne(whatsappGroupId: string) {
    return await this.repoWhatsappGroup.findOne({ where: { whatsappGroupId } });
  }

  async findByNumericId(numericId: string) {
    const groups = await this.repoWhatsappGroup.find();
    return groups.find((g) => g.whatsappGroupId.split('@')[0] === numericId);
  }

  async updatePublish(whatsappGroupId: string) {
    const group = await this.repoWhatsappGroup.findOne({
      where: { whatsappGroupId },
    });
    if (!group) return null;
    group.publishEnabled = !group.publishEnabled;
    return await this.repoWhatsappGroup.save(group);
  }
}
