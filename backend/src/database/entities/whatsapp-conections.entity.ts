import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { WhatsappGroup } from './whatsapp-group.entity';

@Entity('whatsapp_connections')
export class WhatsappConnections {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nameUserConnected: string;

  @ManyToOne(() => User, (user) => user.whatsappConnections, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @OneToMany(
    () => WhatsappGroup,
    (whatsappGroup) => whatsappGroup.whatsappConnection,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  whatsappGroups: WhatsappGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
