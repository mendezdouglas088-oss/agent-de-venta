import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramGroup } from 'src/database/entities/telegram-group.entity';
import { TelegramGroupsService } from './telegram-group.service';
import { TelegramGroupsController } from './telegram-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramGroup])],
  providers: [TelegramGroupsService],
  controllers: [TelegramGroupsController],
  exports: [TelegramGroupsService],
})
export class TelegramGroupModule {}
