import { PlanType } from 'src/database/entities/plan.entity';

export const PLAN_LABELS: Record<string, string> = {
  [PlanType.DAILY]: '🟡 Daily',
  [PlanType.PRO]: '🔵 Pro',
  [PlanType.FREE]: '⚪ Free',
};
