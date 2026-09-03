import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { WhatsappConnections } from 'src/database/entities/whatsapp-conections.entity';

@Injectable()
export class WhatsappConnectionsService {
  constructor(
    @InjectRepository(WhatsappConnections)
    private repo: Repository<WhatsappConnections>,
    private readonly usersService: UsersService,
  ) {}

  async create(data: {
    fullName: string;
    userId: string;
    nameUserConnected: string;
  }) {
    const whatConnection = await this.findAllByUserID(data.userId);
    const res: { nameUserConnected: string; userId: string } = {
      userId: data.userId,
      nameUserConnected: data.fullName,
    };
    if (whatConnection.length > 0) {
      res['nameUserConnected'] = data.nameUserConnected;
    }
    const resObj = this.repo.create(res);
    return this.repo.save(resObj);
  }

  async belongsToUser(connectionId: string, userId: string): Promise<boolean> {
    const connection = await this.repo.findOne({
      where: { id: connectionId, userId },
    });
    return !!connection;
  }

  async findAllByUserID(userId: string) {
    return await this.repo.find({
      where: { userId },
      relations: ['whatsappGroups'],
    });
  }

  async findAllByUser(userId: string) {
    return this.repo.find({ where: { userId } });
  }
}
