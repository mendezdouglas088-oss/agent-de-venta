import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappGroup } from 'src/database/entities/whatsapp-group.entity';
import { WhatsappConnectService } from './whatsapp-connect.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsappScheduler } from './whatsapp.scheduler';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WhatsappGroup]),
    ConfigModule,
    UsersModule, // necesario para inyectar UsersService en WhatsappService
  ],
  providers: [WhatsappConnectService, WhatsappService, WhatsappScheduler],
  controllers: [WhatsappController],
  exports: [WhatsappConnectService, WhatsappService],
})
export class WhatsappModule {}
