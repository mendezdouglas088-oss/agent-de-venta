import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { WhatsappConnectionsInterface } from './domain/whatsapp-provider.interface';
import { WhatsappConnections } from 'src/database/entities/whatsapp-conections.entity';

@Injectable()
export class WhatsappConnectionsService {
  constructor(
    @InjectRepository(WhatsappConnections)
    private repoWhatsappConnections: Repository<WhatsappConnections>,
    private readonly usersService: UsersService,
  ) {}

  async create(data: WhatsappConnectionsInterface) {
    const whatConnection = await this.findAllByUserID(data.user.id);
    const res: { nameUserConnected: string; userId: string } = {
      userId: data.user.id,
      nameUserConnected: data.user.fullName,
    };
    if (!whatConnection) {
      return this.repoWhatsappConnections.save(res);
    }
    res['nameUserConnected'] = data.nameUserConnected;
    return this.repoWhatsappConnections.save(res);
  }

  async findAllByUserID(userId: string) {
    return await this.repoWhatsappConnections.find({
      where: { userId },
      relations: ['whatsappGroups'],
    });
  }
}
