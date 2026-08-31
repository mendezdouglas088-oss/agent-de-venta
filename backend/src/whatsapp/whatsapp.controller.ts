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
} from '@nestjs/common';
import {
  WHATSAPP_PROVIDER,
  WhatsappProvider,
} from './domain/whatsapp-provider.interface';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappGroupService } from './whatsapp-group.service';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly whatsappGroupService: WhatsappGroupService,
  ) {}

  @Post('connect')
  async connect(@Query('telegramId') telegramId: string) {
    await this.provider.connect(telegramId);
    return { status: this.provider.getStatus(telegramId) };
  }

  @Get('qr')
  async getQr(@Query('telegramId') telegramId: string, @Res() res: Response) {
    const status = this.provider.getStatus(telegramId);

    if (['disconnected', 'error', 'auth_failed'].includes(status)) {
      await this.provider.connect(telegramId); // crea la sesión si no existe
    }

    const qr = await this.provider.getQr(telegramId);
    if (!qr) {
      res
        .status(202)
        .json({ message: 'Generando QR, reintenta en unos segundos' });
      return;
    }
    res.type('image/png').send(qr);
  }

  @Get('chats')
  async getChats(@Query('telegramId') telegramId: string) {
    return this.provider.getChats(telegramId);
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
    await this.whatsappGroupService.create(groups, telegramId);
    return groups;
  }

  @Get('groups')
  async getGroups(
    @Req() req: any,
    @Query('whatConnectionId') whatConnectionId?: string,
  ) {
    const user = req.user;
    return await this.whatsappGroupService.findAllById(
      user.id,
      whatConnectionId,
    );
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
