import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['sessionId', 'messageId'])
@Index(['sessionId', 'chatId'])
export class WhatsappMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() chatId: string;
  @Column() messageId: string; // msg.id._serialized — clave de idempotencia
  @Column({ default: false }) fromMe: boolean;
  @Column({ type: 'text', nullable: true }) body: string;
  @Column({ type: 'bigint' }) timestamp: number;
  @Column({ default: false }) isRead: boolean;
  @Column({ nullable: true }) ack: number; // 1 enviado, 2 recibido, 3 leído
  @CreateDateColumn() createdAt: Date;
}
