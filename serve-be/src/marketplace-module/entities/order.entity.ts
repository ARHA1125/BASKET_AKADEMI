import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  PICKUP_READY = 'PICKUP_READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column('decimal')
  totalAmount: number;

  @Column('jsonb')
  items: any; // Simplified: [{ productId, quantity, price }]

  @Column({ nullable: true })
  pickupCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
