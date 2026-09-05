import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import {
  WHATSAPP_PROVIDER,
  WhatsappChatSummary,
  WhatsappProvider,
} from '../domain/whatsapp-provider.interface';

@Injectable()
export class WhatsappSyncService {
  private readonly logger = new Logger(WhatsappSyncService.name);

  constructor(
    @InjectRepository(WhatsappChat)
    private readonly chatRepo: Repository<WhatsappChat>,
    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProvider,
    private readonly gateway: RealtimeGateway, // para emitir eventos de nuevos mensajes
  ) {}

  async syncAll(sessionId: string) {
    const chats: WhatsappChatSummary[] =
      await this.whatsappProvider.getChats(sessionId);

    for (const c of chats) {
      await this.chatRepo.upsert(
        [
          {
            sessionId,
            chatId: c.chatId,
            name: c.name,
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
            unreadCount: c.unreadCount,
          },
        ],
        ['sessionId', 'chatId'],
      );

      const { newCount } = await this.syncMessagesForChat(sessionId, c.chatId);
      try {
        if (newCount > 0) {
          const { total } = await this.chatRepo
            .createQueryBuilder('c')
            .select('COALESCE(SUM(c.unreadCount), 0)', 'total')
            .where('c.sessionId = :sessionId', { sessionId })
            .getRawOne();

          this.gateway.emitNewMessages(
            sessionId,
            c.chatId,
            newCount,
            Number(total),
          );
        }
      } catch (error) {
        console.log(
          ` Error al emitir evento de nuevos mensajes para ${sessionId} - ${c.chatId}:`,
          error,
        );
      }
    }
  }

  async syncMessagesForChat(sessionId: string, chatId: string, limit = 50) {
    const client = this.whatsappProvider.getClient(sessionId);
    if (!client) return { chatId, newCount: 0 };

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });
    const incomingIds = messages.map((m) => m.id.id);

    const existing = await this.messageRepo.find({
      where: { sessionId, messageId: In(incomingIds) },
      select: ['messageId'],
    });
    const existingIds = new Set(existing.map((e) => e.messageId));
    const newMessages = messages.filter((m) => !existingIds.has(m.id.id));
    if (!newMessages.length) return { chatId, newCount: 0 };

    await this.messageRepo.insert(
      newMessages.map((m) => ({
        sessionId,
        chatId,
        messageId: m.id.id,
        fromMe: m.fromMe,
        body: m.body,
        timestamp: m.timestamp,
        isRead: m.fromMe,
        ack: m.ack,
      })),
    );

    return { chatId, newCount: newMessages.length };
  }
}
