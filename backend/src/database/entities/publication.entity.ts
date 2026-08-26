import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

/**
 * Entidad para gestionar publicaciones
 * Una publicación puede tener múltiples productos
 */
@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: true })
  active: boolean;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'publication_products',
    joinColumn: { name: 'publication_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @Column('simple-array', { nullable: true })
  telegramGroupIds: string[];

  /**
   * IDs numéricos de grupos de WhatsApp (solo la parte numérica)
   * Ejemplo: ["120363411776880220", "120363411776880221"]
   * Nota: En la BD de whatsapp_groups se guarda completo (con @g.us)
   */
  @Column('simple-array', { nullable: true })
  whatsappGroupIds: string[];

  @ManyToOne(() => User, (user) => user.publications, {
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
