import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WhatsappChatService {
  constructor(
    @InjectRepository(WhatsappChat)
    private readonly chatRepo: Repository<WhatsappChat>,
  ) {}

  async findAll(sessionId: string): Promise<WhatsappChat[]> {
    return this.chatRepo.find({
      where: { sessionId },
      order: { lastMessageAt: 'DESC' },
    });
  }

  async updateReadCount(
    sessionId: string,
    chatId: string,
    unreadCount: number,
  ) {
    await this.chatRepo.update({ sessionId, chatId }, { unreadCount });
  }

  async getUnreadTotal(sessionId: string) {
    const { total } = await this.chatRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.unreadCount), 0)', 'total')
      .where('c.sessionId = :sessionId', { sessionId })
      .getRawOne();
    return Number(total);
  }
}
