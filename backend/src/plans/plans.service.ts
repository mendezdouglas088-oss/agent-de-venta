import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanType, PLAN_CONFIGS } from 'src/database/entities/plan.entity';
import { UserPlan } from 'src/database/entities/user-plan.entity';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {}

  /**
   * Al iniciar el módulo, asegura que los 3 planes existan en BD
   */
  async onModuleInit() {
    await this.seedPlans();
  }

  /**
   * Crea los planes base si no existen
   */
  private async seedPlans(): Promise<void> {
    for (const type of Object.values(PlanType)) {
      const existing = await this.planRepository.findOne({ where: { type } });
      if (!existing) {
        const plan = this.planRepository.create({
          type,
          ...PLAN_CONFIGS[type],
        });
        await this.planRepository.save(plan);
        this.logger.log(`Plan ${type} creado`);
      }
    }
  }

  /**
   * Obtiene un plan por tipo
   */
  async getPlanByType(type: PlanType): Promise<Plan> {
    return this.planRepository.findOne({ where: { type } });
  }

  /**
   * Obtiene todos los planes disponibles (active = true)
   */
  async getAvailablePlans(): Promise<Plan[]> {
    return this.planRepository.find({ where: { active: true } });
  }

  /**
   * Asigna el plan Free al usuario recién registrado.
   * Si ya tiene un plan activo, no hace nada.
   */
  async assignFreePlan(user: User): Promise<UserPlan> {
    return this.assignPlan(user, PlanType.FREE);
  }

  /**
   * Asigna un plan a un usuario.
   * Si ya tiene un UserPlan, lo reemplaza (actualiza).
   */
  async assignPlan(user: User, planType: PlanType): Promise<UserPlan> {
    const plan = await this.getPlanByType(planType);
    if (!plan) throw new Error(`Plan ${planType} no encontrado`);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Buscar si ya existe un UserPlan para este usuario
    const existing = await this.userPlanRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (existing) {
      existing.plan = plan;
      existing.startDate = now;
      existing.endDate = endDate;
      existing.isActive = true;
      return this.userPlanRepository.save(existing);
    }

    const userPlan = this.userPlanRepository.create({
      user,
      plan,
      startDate: now,
      endDate,
      isActive: true,
    });
    return this.userPlanRepository.save(userPlan);
  }

  /**
   * Obtiene el plan activo de un usuario
   */
  async getUserActivePlan(userId: string): Promise<UserPlan | null> {
    return this.userPlanRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['plan', 'user'],
    });
  }

  /**
   * Verifica si el plan del usuario ha expirado y lo desactiva.
   * Retorna true si está activo, false si expiró.
   */
  async checkAndExpirePlan(userId: string): Promise<boolean> {
    const userPlan = await this.getUserActivePlan(userId);
    if (!userPlan) return false;

    const now = new Date();
    if (now > userPlan.endDate) {
      userPlan.isActive = false;
      await this.userPlanRepository.save(userPlan);
      return false;
    }
    return true;
  }

  /**
   * Días restantes del plan activo del usuario
   */
  async getRemainingDays(userId: string): Promise<number> {
    const userPlan = await this.getUserActivePlan(userId);
    if (!userPlan) return 0;

    const now = new Date();
    const diff = userPlan.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
