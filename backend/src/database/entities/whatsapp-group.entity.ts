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
 * Entidad para grupos de WhatsApp
 *
 * IMPORTANTE: whatsappGroupId se guarda completo (ej: "120363411776880220@g.us")
 * pero en la lógica de negocio se usa solo la parte numérica (ej: "120363411776880220")
 * para selecciones, comparaciones y referencias en publicaciones.
 */
@Entity('whatsapp_groups')
export class WhatsappGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  whatsappGroupId: string; // Se guarda completo: "120363411776880220@g.us"

  @Column()
  title: string;

  @Column({ default: false })
  publishEnabled: boolean;

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
