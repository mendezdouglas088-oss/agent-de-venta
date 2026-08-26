import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { ConversationService } from './services/conversation.service';
import { ConversationCleanupScheduler } from './schedulers/conversation-cleanup.scheduler';
import { ProductsModule } from 'src/products/products.module';
import { OllamaModule } from 'src/ollama/ollama.module';
import { AIModule } from 'src/ai/ai.module';

@Module({
  imports: [ProductsModule, OllamaModule, AIModule],
  controllers: [TelegramController],
  providers: [
    TelegramService,
    ConversationService,
    ConversationCleanupScheduler,
  ],
  exports: [TelegramService, ConversationService],
})
export class TelegramModule {}
