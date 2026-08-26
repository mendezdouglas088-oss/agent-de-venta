import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('config')
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Usuario dueño de esta configuración (null = config global del sistema) */
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ nullable: true })
  userId: string;

  @Column({ default: false })
  publishEnabled: boolean;

  @Column({ default: 600 })
  publishInterval: number;

  @Column({ default: false })
  syncGroupsEnable: boolean;

  @Column({ default: false })
  syncWhatsappGroupsEnable: boolean;

  @Column({ default: false })
  deliveriesEnable: boolean;

  @Column({ default: false })
  recommendMessengersEnable: boolean;

  @Column({ default: false })
  conversationWithAI: boolean;

  @Column({ default: 60 * 60 * 24 * 7 })
  syncGroupsTimeInterval: number;

  @Column({ default: 10 })
  configRefreshInterval: number;
}
