import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanType } from 'src/database/entities/plan.entity';
import { UsersService } from 'src/users/users.service';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getAvailablePlans() {
    return this.plansService.getAvailablePlans();
  }

  @Get('users/:userId/current')
  async getCurrentPlan(@Param('userId') userId: string) {
    const remainingDays = await this.plansService.getRemainingDays(userId);
    const userPlan = await this.plansService.getUserActivePlan(userId);
    return { userPlan, remainingDays };
  }
}
