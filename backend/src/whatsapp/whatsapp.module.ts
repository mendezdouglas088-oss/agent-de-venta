import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappScheduler } from './whatsapp.scheduler';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from 'src/users/users.module';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider.interface';
import { WhatsappWebProvider } from './infrastructure/whatsapp-web.provider';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WhatsappGroup]),
    ConfigModule,
    UsersModule, // necesario para inyectar UsersService en WhatsappService
  ],
  providers: [
    WhatsappService,
    WhatsappScheduler,
    { provide: WHATSAPP_PROVIDER, useClass: WhatsappWebProvider },
  ],
  exports: [WhatsappService, WHATSAPP_PROVIDER],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
