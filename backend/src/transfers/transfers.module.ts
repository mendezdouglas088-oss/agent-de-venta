import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from 'src/database/entities/transfer.entity';
import { TransfersService } from './transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer])],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
