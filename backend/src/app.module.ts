import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { TelegramModule } from './telegram/telegram.module';
import { OllamaModule } from './ollama/ollama.module';
import { ProductsModule } from './products/products.module';
import { ImagesModule } from './images/images.module';
import { TelegramGroupModule } from './telegram-group/telegram-group.module';
import { ConfigModule } from './config/config.module';
import { AIModule } from './ai/ai.module';
import { databaseConfig } from './config/database.config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PublicationModule } from './publication/publication.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    databaseConfig,
    ConfigModule,
    AIModule,
    TelegramModule,
    OllamaModule,
    ProductsModule,
    ImagesModule,
    TelegramGroupModule,
    WhatsappModule,
    PublicationModule,
    UsersModule,
  ],
})
export class AppModule {}
