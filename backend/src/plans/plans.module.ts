import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/database/entities/plan.entity';
import { UserPlan } from 'src/database/entities/user-plan.entity';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, UserPlan]), UsersModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
