import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import {
  WHATSAPP_PROVIDER,
  WhatsappProvider,
} from './domain/whatsapp-provider.interface';

/**
 * Controller HTTP para WhatsApp.
 * Todos los endpoints requieren telegramId para identificar la sesión del usuario.
 */
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly whatsappService: WhatsappService,
  ) {}

  // GET /whatsapp/status?telegramId=xxx
  @Get('status')
  getStatus(@Query('telegramId') telegramId: string) {
    const status = this.provider.getStatus(telegramId ?? '');
    return { status };
  }

  // GET /whatsapp/update-groups?telegramId=xxx
  @Get('update-groups')
  async updateGroups(@Query('telegramId') telegramId: string) {
    const groups = await this.provider.getGroups(telegramId ?? '');
    await this.whatsappService.create(groups, telegramId);
    return groups;
  }

  // GET /whatsapp/groups
  @Get('groups')
  async getGroups(@Query('telegramId') telegramId?: string) {
    return await this.whatsappService.findAll(telegramId);
  }

  // POST /whatsapp/send  { telegramId, groupId, message }
  @Post('send')
  async sendMessage(
    @Body() body: { telegramId: string; groupId: string; message: string },
  ) {
    return await this.provider.sendText(
      body.telegramId,
      body.groupId,
      body.message,
    );
  }

  // POST /whatsapp/send-image  { telegramId, groupId, imageUrls, caption? }
  @Post('send-image')
  async sendImage(
    @Body()
    body: {
      telegramId: string;
      groupId: string;
      imageUrls: string[];
      caption?: string;
    },
  ) {
    return await this.provider.sendImages(
      body.telegramId,
      body.groupId,
      body.imageUrls,
      body.caption,
    );
  }
}
