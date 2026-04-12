import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PlanType } from './plan.entity';

export enum TransferStatus {
  PENDING = 'pending',   // esperando aprobación del admin
  APPROVED = 'approved', // aprobado → plan activado
  REJECTED = 'rejected', // rechazado por el admin
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Usuario que realizó la transferencia */
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  /** Plan que el usuario quiere activar */
  @Column({ type: 'enum', enum: PlanType })
  planType: PlanType;

  /** Fecha extraída del comprobante */
  @Column({ nullable: true })
  transferDate: string;

  /** Número de tarjeta beneficiario (destino) */
  @Column({ nullable: true })
  beneficiary: string;

  /** Número de tarjeta ordenante (origen) */
  @Column({ nullable: true })
  orderer: string;

  /** Monto transferido */
  @Column({ nullable: true })
  amount: string;

  /** Número de transacción */
  @Column({ nullable: true })
  transactionNumber: string;

  /** Texto completo del comprobante enviado por el usuario */
  @Column({ type: 'text' })
  rawReceipt: string;

  /** Estado de la transferencia */
  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @CreateDateColumn()
  createdAt: Date;
}
