import { Config } from './config.entity';
import { Product } from './product.entity';
import { TelegramGroup } from './telegram-group.entity';
import { WhatsappGroup } from './whatsapp-group.entity';
import { Publication } from './publication.entity';
import { User } from './user.entity';
import { Plan } from './plan.entity';
import { UserPlan } from './user-plan.entity';
import { Transfer } from './transfer.entity';
import { WhatsappConnections } from './whatsapp-conections.entity';
import { WhatsappChat } from './whatsapp-chat.entity';
import { WhatsappMessage } from './whatsapp-message.entity';

export const entities = [
  Product,
  Config,
  TelegramGroup,
  Publication,
  User,
  Plan,
  UserPlan,
  Transfer,
  WhatsappConnections,
  WhatsappGroup,
  WhatsappChat,
  WhatsappMessage,
];

export { Plan, PlanType, PLAN_CONFIGS } from './plan.entity';
export { UserPlan } from './user-plan.entity';
export { User } from './user.entity';
export { Transfer, TransferStatus } from './transfer.entity';
