import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { WhatsappController } from './controllers/whatsapp.controller';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { WhatsappScheduler } from './whatsapp.scheduler';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from 'src/users/users.module';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider.interface';
import { WhatsappWebProvider } from './infrastructure/whatsapp-web.provider';
import { AuthModule } from 'src/auth/auth.module';
import { WhatsappGroupService } from './services/whatsapp-group.service';
import { WhatsappConnectionsService } from './services/whatsapp-connections.service';
import { WhatsappConnectionsController } from './controllers/whatsapp-connections.controller';
import { WhatsappConnections } from 'src/database/entities/whatsapp-conections.entity';
import { WhatsappSyncService } from './application/whatsapp-sync.service';
import { WhatsappSyncProcessor } from './infrastructure/producer/whatsapp-sync.processor';
import { WhatsappSyncQueue } from './infrastructure/jobs/whatsapp-sync.queue';
import { WhatsappEventsListener } from './infrastructure/whatsapp-events.listener';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { WhatsappChat } from 'src/database/entities/whatsapp-chat.entity';
import { WhatsappMessage } from 'src/database/entities/whatsapp-message.entity';
import { WhatsappChatService } from './services/whatsapp-chat.service';
import { WhatsappMessageService } from './services/whatsapp-message.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'whatsapp-sync' }),
    HttpModule,
    TypeOrmModule.forFeature([
      WhatsappGroup,
      WhatsappConnections,
      WhatsappChat,
      WhatsappMessage,
    ]),
    ConfigModule,
    AuthModule,
    UsersModule,
    forwardRef(() => RealtimeModule),
  ],
  providers: [
    WhatsappGroupService,
    WhatsappConnectionsService,
    WhatsappScheduler,
    WhatsappEventsListener,
    WhatsappSyncService,
    WhatsappSyncProcessor,
    WhatsappSyncQueue,
    WhatsappChatService,
    WhatsappMessageService,
    { provide: WHATSAPP_PROVIDER, useClass: WhatsappWebProvider },
  ],
  exports: [
    WhatsappGroupService,
    WHATSAPP_PROVIDER,
    WhatsappConnectionsService,
    WhatsappSyncService,
    WhatsappSyncProcessor,
    WhatsappSyncQueue,
    WhatsappChatService,
    WhatsappMessageService,
  ],
  controllers: [WhatsappController, WhatsappConnectionsController],
})
export class WhatsappModule {}
