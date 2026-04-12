import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Interfaz para representar un miembro del grupo
 */
export interface GroupMember {
  username: string;
  telegramUserId: number;
}

@Entity('telegram_groups')
export class TelegramGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint' })
  telegramGroupId: number;

  @Column()
  title: string;

  @Column({ default: false })
  publishEnabled: boolean;

  @Column('jsonb', { default: '[]' })
  members: GroupMember[];

  @ManyToOne(() => User, (user) => user.telegramGroups, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
