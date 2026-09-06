import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import {
  WHATSAPP_PROVIDER,
  WhatsappProvider,
} from '../domain/whatsapp-provider.interface';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { WhatsappConnectionsService } from '../services/whatsapp-connections.service';

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
    private readonly gateway: RealtimeGateway,
    @InjectRepository(WhatsappGroup)
    private readonly groupRepo: Repository<WhatsappGroup>,
    private readonly whatsappConnectionsService: WhatsappConnectionsService,
  ) {}

  async syncAll(sessionId: string) {
    const allChats = await this.whatsappProvider.getAllChats(sessionId);

    const chatIds = allChats.filter((c) => !c.isGroup).map((c) => c.chatId);
    const groupIds = allChats.filter((c) => c.isGroup).map((c) => c.chatId);

    const existingChats = chatIds.length
      ? await this.chatRepo.find({
          where: { sessionId, chatId: In(chatIds) },
          select: ['chatId', 'isNew'],
        })
      : [];
    const existingChatsMap = new Map(existingChats.map((c) => [c.chatId, c]));

    const existingGroupIds = new Set(
      (groupIds.length
        ? await this.groupRepo.find({
            where: { whatsappGroupId: In(groupIds) },
            select: ['whatsappGroupId'],
          })
        : []
      ).map((g) => g.whatsappGroupId),
    );

    const connection =
      await this.whatsappConnectionsService.findByConnectionId(sessionId);
    const whatsappConnectionId = connection?.id ?? null;

    for (const c of allChats) {
      const existingChat = !c.isGroup
        ? existingChatsMap.get(c.chatId)
        : undefined;
      const isNewGroup = c.isGroup && !existingGroupIds.has(c.chatId);
      const isNewChat = !c.isGroup && !existingChat;

      if (c.isGroup) {
        await this.groupRepo.upsert(
          {
            whatsappGroupId: c.chatId,
            title: c.name,
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
            unreadCount: c.unreadCount,
            participantsCount: c.participantsCount,
            whatsappConnectionId,
          },
          ['whatsappGroupId'],
        );
        if (isNewGroup) {
          this.gateway.emitNewGroup(sessionId, {
            whatsappGroupId: c.chatId,
            title: c.name,
            unreadCount: c.unreadCount,
          });
        }
      } else {
        await this.chatRepo.upsert(
          [
            {
              sessionId,
              chatId: c.chatId,
              name: c.name,
              lastMessage: c.lastMessage,
              lastMessageAt: c.lastMessageAt,
              unreadCount: c.unreadCount,
              isSavedContact: c.isSavedContact ?? null,
              isNew: existingChat ? existingChat.isNew : true,
            },
          ],
          ['sessionId', 'chatId'],
        );
        if (isNewChat) {
          this.gateway.emitNewChat(sessionId, {
            chatId: c.chatId,
            name: c.name,
            unreadCount: c.unreadCount,
          });
        }
      }

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
          `Error al emitir evento de nuevos mensajes para ${sessionId} - ${c.chatId}:`,
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
    const meId = client.info?.wid?._serialized;

    const rows = messages.map((m) => ({
      sessionId,
      chatId,
      messageId: m.id.id,
      fromMe: m.fromMe,
      body: m.body,
      timestamp: m.timestamp,
      isRead: m.fromMe,
      ack: m.ack,
      isGroup: chat.isGroup,
      type: m.type,
      hasMedia: m.hasMedia,
      author: chat.isGroup ? m.author : undefined,
      serializedId: m.id._serialized,
      mentionsMe: !!meId && (m.mentionedIds ?? []).includes(meId),
    }));

    const result = await this.messageRepo
      .createQueryBuilder()
      .insert()
      .into(this.messageRepo.target)
      .values(rows)
      .orIgnore()
      .execute();

    return { chatId, newCount: result.identifiers.filter(Boolean).length };
  }
}
