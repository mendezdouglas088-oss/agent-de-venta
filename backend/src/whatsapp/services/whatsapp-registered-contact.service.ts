import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappRegisteredContact } from 'src/database/entities/whatsapp-registered-contact.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WhatsappRegisteredContactsService {
  constructor(
    @InjectRepository(WhatsappRegisteredContact)
    private readonly repo: Repository<WhatsappRegisteredContact>,
  ) {}

  async create(data: {
    sessionId: string;
    chatId: string;
    name: string;
    phoneNumber?: string;
    notes?: string;
  }) {
    const existing = await this.repo.findOne({
      where: { sessionId: data.sessionId, chatId: data.chatId },
    });
    if (existing) {
      throw new ConflictException('Este contacto ya está registrado');
    }
    const contact = this.repo.create({
      sessionId: data.sessionId,
      chatId: data.chatId,
      name: data.name,
      phoneNumber: data.phoneNumber ?? data.chatId.split('@')[0],
      notes: data.notes,
    });
    return this.repo.save(contact);
  }

  async findAll(sessionId: string) {
    return this.repo.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(sessionId: string, id: string) {
    const contact = await this.repo.findOne({ where: { sessionId, id } });
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return contact;
  }

  async update(
    sessionId: string,
    id: string,
    data: { name?: string; phoneNumber?: string; notes?: string },
  ) {
    const contact = await this.findOne(sessionId, id);
    Object.assign(contact, data);
    return this.repo.save(contact);
  }

  async remove(sessionId: string, id: string) {
    const contact = await this.findOne(sessionId, id);
    await this.repo.remove(contact);
    return { ok: true };
  }
}
