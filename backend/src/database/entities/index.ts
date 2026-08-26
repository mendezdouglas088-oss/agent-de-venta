import { Config } from './config.entity';
import { Product } from './product.entity';
import { TelegramGroup } from './telegram-group.entity';
import { WhatsappGroup } from './whatsapp-group.entity';
import { Publication } from './publication.entity';
import { User } from './user.entity';
import { Plan } from './plan.entity';
import { UserPlan } from './user-plan.entity';
import { Transfer } from './transfer.entity';

export const entities = [
  Product,
  Config,
  TelegramGroup,
  WhatsappGroup,
  Publication,
  User,
  Plan,
  UserPlan,
  Transfer,
];

export { Plan, PlanType, PLAN_CONFIGS } from './plan.entity';
export { UserPlan } from './user-plan.entity';
export { User } from './user.entity';
export { Transfer, TransferStatus } from './transfer.entity';
