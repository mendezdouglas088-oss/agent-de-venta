import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { Publication } from './publication.entity';
import { TelegramGroup } from './telegram-group.entity';
import { WhatsappGroup } from './whatsapp-group.entity';
import { UserPlan } from './user-plan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID único de usuario en Telegram */
  @Column({ unique: true })
  telegramId: string;

  /** Hash de autenticación para Telegram */
  @Column({ unique: true, nullable: true })
  telegramApiId: string;

  /** Hash de autenticación para Telegram */
  @Column({ unique: true, nullable: true })
  telegramApiHash: string;

  /** Token del bot de Telegram */
  @Column({ unique: true, nullable: true })
  telegramBotToken: string;

  /** Indica si el usuario está activo (false = no puede hacer nada, debe comprar plan) */
  @Column({ default: true })
  isActive: boolean;

  /** Indica si el usuario tiene un plan activo */
  @Column({ default: false })
  hasPlan: boolean;

  /** Número de teléfono del usuario */
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  /** Nombre de usuario en Telegram */
  @Column({ nullable: true })
  firstName: string;

  /** Nombre de usuario en Telegram */
  @Column({ unique: true, nullable: true })
  username: string;

  /** Plan activo del usuario */
  @OneToOne(() => UserPlan, (userPlan) => userPlan.user, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  userPlan: UserPlan;

  @OneToMany(() => Product, (product) => product.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products: Product[];

  @OneToMany(() => Publication, (publication) => publication.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  publications: Publication[];

  @OneToMany(() => TelegramGroup, (telegramGroup) => telegramGroup.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  telegramGroups: TelegramGroup[];

  @OneToMany(() => WhatsappGroup, (whatsappGroup) => whatsappGroup.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  whatsappGroups: WhatsappGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
