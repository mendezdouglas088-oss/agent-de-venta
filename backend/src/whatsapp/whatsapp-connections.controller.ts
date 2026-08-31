import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappConnectionsService } from './whatsapp-connections.service';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp-connections')
export class WhatsappConnectionsController {
  constructor(
    private readonly whatsappConnectionsService: WhatsappConnectionsService,
  ) {}

  @Post('create')
  create(@Req() req, @Body() body: { nameUserConnected: string }) {
    const user = req.user;
    return this.whatsappConnectionsService.create({
      user,
      nameUserConnected: body.nameUserConnected,
    });
  }

  @Get()
  async findAllByUserID(@Req() req) {
    const user = req.user;
    return this.whatsappConnectionsService.findAllByUserID(user.id);
  }
}
