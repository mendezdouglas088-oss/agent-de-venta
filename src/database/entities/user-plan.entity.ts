import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Plan } from './plan.entity';

@Entity('user_plans')
export class UserPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Usuario dueño del plan */
  @OneToOne(() => User, (user) => user.userPlan, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  /** Plan asignado */
  @ManyToOne(() => Plan, { eager: true })
  plan: Plan;

  /** Fecha de inicio del plan */
  @Column()
  startDate: Date;

  /** Fecha de expiración del plan */
  @Column()
  endDate: Date;

  /** Indica si el plan sigue activo (false cuando expira) */
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
