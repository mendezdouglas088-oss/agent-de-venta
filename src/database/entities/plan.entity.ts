import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PlanType {
  FREE = 'free',
  DAILY = 'daily',
  PRO = 'pro',
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Tipo de plan (free, daily, pro) */
  @Column({ type: 'enum', enum: PlanType, unique: true })
  type: PlanType;

  /** Máximo de publicaciones permitidas */
  @Column()
  maxPublication: number;

  /** Máximo de grupos permitidos */
  @Column()
  maxGroups: number;

  /** Indica si los roles están activos en este plan */
  @Column({ default: false })
  rolesActive: boolean;

  /** Indica si la respuesta automática está activa en este plan */
  @Column({ default: false })
  autoReply: boolean;

  /** Duración del plan en días (7 para Free, 30 para Daily/Pro) */
  @Column()
  durationDays: number;

  /** Indica si el plan está disponible para ser contratado */
  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/** Configuración estática de los planes */
export const PLAN_CONFIGS = {
  [PlanType.FREE]: {
    maxPublication: 300,
    maxGroups: 2,
    rolesActive: false,
    autoReply: false,
    durationDays: 7,
    active: true,
    price: 0,
  },
  [PlanType.DAILY]: {
    maxPublication: 1000,
    maxGroups: 5,
    rolesActive: false,
    autoReply: false,
    durationDays: 30,
    active: true,
    price: 520,
  },
  [PlanType.PRO]: {
    maxPublication: 2000,
    maxGroups: 13,
    rolesActive: true,
    autoReply: true,
    durationDays: 30,
    active: true,
    price: 950,
  },
};
