import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  Res,
  UseGuards,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  WHATSAPP_PROVIDER,
  WhatsappProvider,
} from '../domain/whatsapp-provider.interface';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappGroupService } from '../services/whatsapp-group.service';
import { WhatsappChatService } from '../services/whatsapp-chat.service';
import { WhatsappMessageService } from '../services/whatsapp-message.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { WhatsappSyncQueue } from '../infrastructure/jobs/whatsapp-sync.queue';
import { tryCatch } from 'bullmq';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly whatsappGroupService: WhatsappGroupService,
    private readonly chatsService: WhatsappChatService,
    private readonly messageService: WhatsappMessageService,
    private readonly gateway: RealtimeGateway,
    private readonly syncQueue: WhatsappSyncQueue,
  ) {}

  @Post('connect')
  async connect(@Query('connectionId') connectionId: string) {
    await this.provider.connect(connectionId);
    return { status: this.provider.getStatus(connectionId) };
  }

  @Get('qr')
  async getQr(
    @Query('connectionId') connectionId: string,
    @Res() res: Response,
  ) {
    const status = this.provider.getStatus(connectionId);

    if (['disconnected', 'error', 'auth_failed'].includes(status)) {
      await this.provider.connect(connectionId); // crea la sesión si no existe
    }

    const qr = await this.provider.getQr(connectionId);
    if (!qr) {
      res
        .status(202)
        .json({ message: 'Generando QR, reintenta en unos segundos' });
      return;
    }
    res.type('image/png').send(qr);
  }

  @Get('chats')
  async getChats(@Query('connectionId') connectionId: string) {
    const chats = await this.chatsService.findAll(connectionId);
    this.syncQueue.enqueueSync(connectionId).catch(() => {}); // refresco en background, no bloquea la respuesta
    return chats;
  }

  @Get('messages')
  async getMessages(
    @Query('connectionId') connectionId: string,
    @Query('chatId') chatId: string,
    @Query('limit', new DefaultValuePipe(150), ParseIntPipe) limit: number,
  ) {
    return await this.messageService.findAll(connectionId, chatId, limit);
  }

  @Post('mark-as-read')
  async markChatAsRead(
    @Query('connectionId') connectionId: string,
    @Query('chatId') chatId: string,
  ) {
    await this.messageService.markAsRead(connectionId, chatId);
    await this.chatsService.updateReadCount(connectionId, chatId, 0);
    const totalUnread = await this.chatsService.getUnreadTotal(connectionId);
    this.gateway.emitNewMessages(connectionId, chatId, 0, totalUnread);
  }

  @Post('logout')
  async logout(@Query('connectionId') connectionId: string) {
    await this.provider.logout(connectionId);
    return { status: 'disconnected' };
  }

  @Get('status')
  getStatus(@Query('connectionId') connectionId: string) {
    const status = this.provider.getStatus(connectionId ?? '');
    return { status };
  }

  @Post('sync')
  async syncAll(@Query('connectionId') connectionId: string) {
    await this.syncQueue.enqueueFullSync(connectionId);
    return { queued: true };
  }

  @Get('update-groups')
  async updateGroups(@Query('connectionId') connectionId: string) {
    const groups = await this.provider.getGroups(connectionId ?? '');
    await this.whatsappGroupService.create(groups, connectionId);
    return groups;
  }

  @Get('groups')
  async getGroups(
    @Req() req: any,
    @Query('connectionId') connectionId?: string,
  ) {
    try {
      const user = req.user;
      return await this.whatsappGroupService.findAllById(user.id, connectionId);
    } catch (error) {
      return {
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('send_message')
  async sendMessage(
    @Body() body: { connectionId: string; chatId: string; message: string },
  ) {
    return await this.provider.sendText(
      body.connectionId,
      body.chatId,
      body.message,
    );
  }

  @Post('send-image')
  async sendImage(
    @Body()
    body: {
      connectionId: string;
      groupId: string;
      imageUrls: string[];
      caption?: string;
    },
  ) {
    return await this.provider.sendImages(
      body.connectionId,
      body.groupId,
      body.imageUrls,
      body.caption,
    );
  }

  @Post('send-media')
  async sendMedia(
    @Body()
    body: {
      connectionId: string;
      chatId: string;
      mimetype: string;
      data: string; // base64
      filename?: string;
      caption?: string;
    },
  ) {
    return await this.provider.sendMedia(
      body.connectionId,
      body.chatId,
      { mimetype: body.mimetype, data: body.data, filename: body.filename },
      { caption: body.caption },
    );
  }

  @Get('media/:messageId')
  async getMedia(
    @Query('connectionId') connectionId: string,
    @Param('messageId') messageId: string,
  ) {
    return await this.provider.getMedia(connectionId, messageId);
  }

  @Get('chats/new')
  async getNewChats(@Query('connectionId') connectionId: string) {
    return this.chatsService.findNew(connectionId);
  }

  @Post('chats/:chatId/seen')
  async markChatSeen(
    @Query('connectionId') connectionId: string,
    @Param('chatId') chatId: string,
  ) {
    await this.chatsService.markSeen(connectionId, chatId);
    return { ok: true };
  }

  @Get('chats/unregistered')
  async getUnregisteredChats(@Query('connectionId') connectionId: string) {
    return this.chatsService.findUnregistered(connectionId);
  }

  @Get('groups/:groupId/messages')
  async getGroupMessages(
    @Query('connectionId') connectionId: string,
    @Param('groupId') groupId: string,
    @Query('limit', new DefaultValuePipe(150), ParseIntPipe) limit: number,
  ) {
    return this.messageService.findAll(connectionId, groupId, limit);
  }

  @Get('mentions')
  async getMentions(
    @Query('connectionId') connectionId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.messageService.findMentions(connectionId, limit);
  }
}
