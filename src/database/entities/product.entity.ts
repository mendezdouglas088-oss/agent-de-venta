import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('float')
  price: number;

  @Column({ default: true })
  available: boolean;

  @Column('jsonb')
  embedding: number[];

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true, type: 'float' })
  cant?: number;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;
}
