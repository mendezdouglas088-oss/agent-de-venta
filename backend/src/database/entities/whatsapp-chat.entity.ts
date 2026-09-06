import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'whatsapp_chats' })
@Unique(['sessionId', 'chatId'])
export class WhatsappChat {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() chatId: string;
  @Column() name: string;
  @Column({ type: 'text', nullable: true }) lastMessage: string;
  @Column({ type: 'bigint', nullable: true }) lastMessageAt: number;
  @Column({ default: 0 }) unreadCount: number;

  @Column({ default: true }) isNew: boolean; // true hasta que el usuario lo marca visto
  @Column({ type: 'boolean', nullable: true }) isSavedContact: boolean | null; // null = aún no sincronizado
}
