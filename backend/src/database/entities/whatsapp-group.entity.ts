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
import { WhatsappConnections } from './whatsapp-conections.entity';

/**
 * Entidad para grupos de WhatsApp
 *
 * IMPORTANTE: whatsappGroupId se guarda completo (ej: "120363411776880220@g.us")
 * pero en la lógica de negocio se usa solo la parte numérica (ej: "120363411776880220")
 * para selecciones, comparaciones y referencias en publicaciones.
 */
@Entity('whatsapp_groups')
export class WhatsappGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  whatsappGroupId: string; // Se guarda completo: "120363411776880220@g.us"

  @Column()
  title: string;

  @Column({ default: false })
  publishEnabled: boolean;

  @ManyToOne(
    () => WhatsappConnections,
    (whatsappConnections) => whatsappConnections.whatsappGroups,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'whatsappConnectionId' })
  whatsappConnection: WhatsappConnections;

  @Column({ nullable: true })
  whatsappConnectionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
