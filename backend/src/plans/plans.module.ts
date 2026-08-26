import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/database/entities/plan.entity';
import { UserPlan } from 'src/database/entities/user-plan.entity';
import { PlansService } from './plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, UserPlan])],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
