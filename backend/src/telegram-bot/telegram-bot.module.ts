import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ProductsModule } from '../products/products.module';
import { TelegramGroupModule } from 'src/telegram-group/telegram-group.module';
import { ConfigModule } from 'src/config/config.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { PublicationModule } from 'src/publication/publication.module';
import { PlansModule } from 'src/plans/plans.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import * as dotenv from 'dotenv';

import { TelegramBotUpdate } from './telegram-bot.update';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';

import {
  StateManagerService,
  KeyboardBuilderService,
  BotMessageService,
  ConfigManagerService,
} from './services';
import { PaginationService } from './services/pagination.service';

import {
  ProductHandler,
  GroupHandler,
  WhatsappGroupHandler,
  PublicationHandler,
  MessengerHandler,
  SettingsHandler,
  NavigationHandler,
  ConfigHandler,
  PlanHandler,
  AdminHandler,
} from './handlers';

import { AdminGuard } from './guards/admin.guard';
import { UsersModule } from 'src/users/users.module';

dotenv.config();

@Module({
  imports: [
    TelegrafModule.forRoot({ token: process.env.TELEGRAM_BOT_TOKEN }),
    ProductsModule,
    TelegramGroupModule,
    WhatsappModule,
    PublicationModule,
    ConfigModule,
    UsersModule,
    PlansModule,
    TransfersModule,
  ],
  providers: [
    TelegramBotUpdate,
    TelegramBotService,
    StateManagerService,
    KeyboardBuilderService,
    BotMessageService,
    PaginationService,
    ConfigManagerService,
    ProductHandler,
    GroupHandler,
    WhatsappGroupHandler,
    PublicationHandler,
    MessengerHandler,
    SettingsHandler,
    NavigationHandler,
    ConfigHandler,
    PlanHandler,
    AdminHandler,
    AdminGuard,
  ],
  controllers: [TelegramBotController],
  exports: [StateManagerService],
})
export class TelegramBotModule {}
