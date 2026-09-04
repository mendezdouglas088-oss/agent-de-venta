import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { WhatsappGroupInterface } from './domain/whatsapp-provider.interface';
import { WhatsappConnections } from 'src/database/entities/whatsapp-conections.entity';
import { WhatsappConnectionsService } from './whatsapp-connections.service';

@Injectable()
export class WhatsappGroupService {
  constructor(
    @InjectRepository(WhatsappGroup)
    private repoWhatsappGroup: Repository<WhatsappGroup>,
    @InjectRepository(WhatsappConnections)
    private whatsappConnectionsService: WhatsappConnectionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sincroniza grupos de WhatsApp en BD.
   * @param listGroups Lista de grupos obtenidos de whatsapp-web.js
   * @param whatsappConnectionId ID de la conexión de WhatsApp a la que pertenecen los grupos
   */
  async create(
    groups: WhatsappGroupInterface[],
    whatsappConnectionId?: string | null,
  ) {
    for (const group of groups) {
      await this.repoWhatsappGroup.upsert(
        {
          whatsappGroupId: group.whatsappGroupId,
          title: group.title,
          whatsappConnectionId: whatsappConnectionId || null,
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
