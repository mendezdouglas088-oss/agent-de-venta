import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import {
  WHATSAPP_PROVIDER,
  WhatsappProvider,
} from './domain/whatsapp-provider.interface';
import { Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Post('connect')
  async connect(@Query('telegramId') telegramId: string) {
    await this.provider.connect(telegramId);
    return { status: this.provider.getStatus(telegramId) };
  }

  @Get('qr')
  async getQr(@Query('telegramId') telegramId: string, @Res() res: Response) {
    const qr = await this.provider.getQr(telegramId);
    if (!qr) throw new NotFoundException('No hay QR disponible todavía');
    res.type('image/png').send(qr);
  }

  @Post('logout')
  async logout(@Query('telegramId') telegramId: string) {
    await this.provider.logout(telegramId);
    return { status: 'disconnected' };
  }

  @Get('status')
  getStatus(@Query('telegramId') telegramId: string) {
    const status = this.provider.getStatus(telegramId ?? '');
    return { status };
  }

  @Get('update-groups')
  async updateGroups(@Query('telegramId') telegramId: string) {
    const groups = await this.provider.getGroups(telegramId ?? '');
    await this.whatsappService.create(groups, telegramId);
    return groups;
  }

  @Get('groups')
  async getGroups(@Query('telegramId') telegramId?: string) {
    return await this.whatsappService.findAll(telegramId);
  }

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
