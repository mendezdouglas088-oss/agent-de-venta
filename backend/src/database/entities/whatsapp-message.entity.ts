import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'whatsapp_messages' })
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
  @Column({ nullable: true }) ack: number;

  @Column({ default: false }) isGroup: boolean;
  @Column({ type: 'varchar', default: 'chat' }) type: string; // 'chat'|'image'|'video'|'audio'|'ptt'|'document'|'sticker'|'call_log'|'location'|'vcard'|'unknown'
  @Column({ default: false }) hasMedia: boolean;
  @Column({ nullable: true }) author: string; // jid de quien envió, solo en grupos
  @Column({ nullable: true }) authorName: string;
  @Column({ default: false }) mentionsMe: boolean;
  @Column({ nullable: true }) serializedId: string;

  @CreateDateColumn() createdAt: Date;
}
