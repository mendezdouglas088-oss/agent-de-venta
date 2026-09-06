import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { Repository } from 'typeorm';
import { WhatsappSyncQueue } from './jobs/whatsapp-sync.queue';
import { OnEvent } from '@nestjs/event-emitter';
import { WhatsappMessagePersistPayload } from '../domain/whatsapp-provider.interface';

@Injectable()
export class WhatsappEventsListener {
  constructor(
    @InjectRepository(WhatsappChat)
    private readonly chatRepo: Repository<WhatsappChat>,
    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
    @InjectRepository(WhatsappGroup)
    private readonly groupRepo: Repository<WhatsappGroup>,
    private readonly gateway: RealtimeGateway,
    private readonly syncQueue: WhatsappSyncQueue,
  ) {}

  @OnEvent('whatsapp.message.persist')
  async handleMessage(payload: WhatsappMessagePersistPayload) {
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
        isGroup: payload.isGroup,
        type: payload.type,
        hasMedia: payload.hasMedia,
        author: payload.author,
        authorName: payload.authorName,
        mentionsMe: payload.mentionsMe,
        serializedId: payload.serializedId,
      })
      .orIgnore()
      .execute();

    if (payload.isGroup) {
      // el sync periódico también toca esta tabla; aquí solo reflejamos actividad en vivo
      await this.groupRepo.upsert(
        [
          {
            whatsappGroupId: payload.chatId,
            title: payload.chatName,
            lastMessage: payload.body,
            lastMessageAt: payload.timestamp,
            unreadCount: payload.unreadCount,
          },
        ],
        ['whatsappGroupId'],
      );
    } else {
      // no pisar isNew: si el chat ya existía, se conserva su valor actual
      const existingChat = await this.chatRepo.findOne({
        where: { sessionId: payload.sessionId, chatId: payload.chatId },
        select: ['isNew'],
      });

      await this.chatRepo.upsert(
        [
          {
            sessionId: payload.sessionId,
            chatId: payload.chatId,
            name: payload.chatName,
            lastMessage: payload.body,
            lastMessageAt: payload.timestamp,
            unreadCount: payload.unreadCount,
            isNew: existingChat ? existingChat.isNew : true,
          },
        ],
        ['sessionId', 'chatId'],
      );
    }

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
