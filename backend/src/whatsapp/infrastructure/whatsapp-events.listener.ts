import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { Repository } from 'typeorm';
import { WhatsappSyncQueue } from './jobs/whatsapp-sync.queue';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WhatsappEventsListener {
  constructor(
    @InjectRepository(WhatsappChat)
    private readonly chatRepo: Repository<WhatsappChat>,
    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
    private readonly gateway: RealtimeGateway,
    private readonly syncQueue: WhatsappSyncQueue,
  ) {}

  @OnEvent('whatsapp.message.persist')
  async handleMessage(payload: {
    sessionId: string;
    chatId: string;
    chatName: string;
    messageId: string;
    fromMe: boolean;
    body: string;
    timestamp: number;
    ack: number;
    unreadCount: number;
  }) {
    const result = await this.messageRepo
      .createQueryBuilder()
      .insert()
      .values({
        sessionId: payload.sessionId,
        chatId: payload.chatId,
        messageId: payload.messageId,
        fromMe: payload.fromMe,
        body: payload.body,
        timestamp: payload.timestamp,
        isRead: payload.fromMe,
        ack: payload.ack,
      })
      .orIgnore()
      .execute();

    await this.chatRepo.upsert(
      [
        {
          sessionId: payload.sessionId,
          chatId: payload.chatId,
          name: payload.chatName,
          lastMessage: payload.body,
          lastMessageAt: payload.timestamp,
          unreadCount: payload.unreadCount,
        },
      ],
      ['sessionId', 'chatId'],
    );

    if (result.identifiers.length > 0 && !payload.fromMe) {
      const { total } = await this.chatRepo
        .createQueryBuilder('c')
        .select('COALESCE(SUM(c.unreadCount), 0)', 'total')
        .where('c.sessionId = :sessionId', { sessionId: payload.sessionId })
        .getRawOne();
      this.gateway.emitNewMessages(
        payload.sessionId,
        payload.chatId,
        1,
        Number(total),
      );
    }
  }

  @OnEvent('whatsapp.status')
  async handleStatus(payload: { connectionId: string; status: string }) {
    if (payload.status === 'connected') {
      await this.syncQueue.enqueueSync(payload.connectionId);
      await this.syncQueue.scheduleRecurringSync(payload.connectionId);
    }
    if (payload.status === 'disconnected') {
      await this.syncQueue.stopRecurringSync(payload.connectionId);
    }
  }
}
