import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WhatsappMessageService {
  constructor(
    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {}

  async findAll(
    sessionId: string,
    chatId: string,
    limit: number,
  ): Promise<WhatsappMessage[]> {
    return this.messageRepo.find({
      where: { sessionId, chatId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(sessionId: string, chatId: string) {
    await this.messageRepo.update(
      { sessionId, chatId, isRead: false },
      { isRead: true },
    );
  }
}
