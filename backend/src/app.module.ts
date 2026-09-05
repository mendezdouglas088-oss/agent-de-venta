import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { bullConfig } from './config/bullmq.config';

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
import { RealtimeModule } from './realtime/realtime.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot(bullConfig),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    databaseConfig,
    ConfigModule,
    AIModule,
    AuthModule,
    TelegramModule,
    OllamaModule,
    ProductsModule,
    ImagesModule,
    TelegramGroupModule,
    WhatsappModule,
    PublicationModule,
    UsersModule,
    RealtimeModule,
  ],
})
export class AppModule {}
