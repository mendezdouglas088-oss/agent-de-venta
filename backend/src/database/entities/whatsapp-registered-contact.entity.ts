import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'whatsapp_registered_contacts' })
@Unique(['sessionId', 'chatId'])
export class WhatsappRegisteredContact {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() chatId: string; // ej: 5215512345678@c.us
  @Column() name: string;
  @Column({ nullable: true }) phoneNumber: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
