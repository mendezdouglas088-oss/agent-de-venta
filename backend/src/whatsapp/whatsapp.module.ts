import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { WhatsappScheduler } from './whatsapp.scheduler';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from 'src/users/users.module';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider.interface';
import { WhatsappWebProvider } from './infrastructure/whatsapp-web.provider';
import { AuthModule } from 'src/auth/auth.module';
import { WhatsappGroupService } from './whatsapp-group.service';
import { WhatsappConnectionsService } from './whatsapp-connections.service';
import { WhatsappConnectionsController } from './whatsapp-connections.controller';
import { WhatsappConnections } from 'src/database/entities/whatsapp-conections.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WhatsappGroup, WhatsappConnections]),
    ConfigModule,
    AuthModule,
    UsersModule, // necesario para inyectar UsersService en WhatsappService
  ],
  providers: [
    WhatsappGroupService,
    WhatsappConnectionsService,
    WhatsappScheduler,
    { provide: WHATSAPP_PROVIDER, useClass: WhatsappWebProvider },
  ],
  exports: [
    WhatsappGroupService,
    WHATSAPP_PROVIDER,
    WhatsappConnectionsService,
  ],
  controllers: [WhatsappController, WhatsappConnectionsController],
})
export class WhatsappModule {}
