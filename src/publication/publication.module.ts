import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { PublicationScheduler } from './publication.scheduler';
import { Publication } from '../database/entities/publication.entity';
import { Product } from '../database/entities/product.entity';

import { ConfigModule } from 'src/config/config.module';
import { TelegramGroupModule } from 'src/telegram-group/telegram-group.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { UserbotModule } from 'src/userbot/userbot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publication, Product]),
    ConfigModule,
    TelegramGroupModule,
    WhatsappModule,
    UserbotModule, // ← PublicationScheduler inyecta UserbotClientService opcionalmente
  ],
  providers: [PublicationService, PublicationScheduler],
  controllers: [PublicationController],
  exports: [PublicationService],
})
export class PublicationModule {}
