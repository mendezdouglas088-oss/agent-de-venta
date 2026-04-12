import { Module } from '@nestjs/common';
import { UserbotClientService } from './userbot-client.service';
import { UserbotMessageService } from './userbot-message.service';
import { UserbotController } from './userbot.controller';
import { GroupsSyncScheduler } from './schedulers/groups-sync.scheduler';

// Módulos internos que necesita el userbot
import { TelegramModule } from 'src/telegram/telegram.module';
import { TelegramGroupModule } from 'src/telegram-group/telegram-group.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    TelegramModule, // → TelegramService (AI handler)
    TelegramGroupModule, // → TelegramGroupsService (sync y allowed members)
    ConfigModule, // → ConfigService (flags de configuración)
  ],
  providers: [
    UserbotClientService, // cliente GramJS
    UserbotMessageService, // handler de mensajes privados
    GroupsSyncScheduler, // scheduler de sync de grupos
  ],
  controllers: [UserbotController],
  exports: [
    UserbotClientService, // exportado para que PublicationScheduler lo use
  ],
})
export class UserbotModule {}
