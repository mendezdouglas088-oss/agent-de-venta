import { Body, Controller, Get, Post } from '@nestjs/common';
import { TelegramGroupsService } from './telegram-group.service';
import { SyncTelegramGroupsDto } from './dto/sync-groups.dto';

@Controller('telegram/groups')
export class TelegramGroupsController {
  constructor(private readonly service: TelegramGroupsService) {}

  @Post('sync')
  async syncGroups(@Body() dto: SyncTelegramGroupsDto) {
    const result = await this.service.syncGroups(dto.group);
    return {
      ok: true,
      ...result,
    };
  }

  @Get('publishable')
  async getPublishableGroups() {
    return this.service.getPublishableGroups();
  }
}
