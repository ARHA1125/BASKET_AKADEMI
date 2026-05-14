import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';
import { Student } from '../../academic-module/entities/student.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  PICKUP_READY = 'PICKUP_READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MarketplacePaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export enum MarketplacePaymentStatus {
  PENDING = 'PENDING',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Student, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  linkedStudent: Student | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: MarketplacePaymentMethod,
    default: MarketplacePaymentMethod.CASH,
  })
  paymentMethod: MarketplacePaymentMethod;

  @Column({
    type: 'enum',
    enum: MarketplacePaymentStatus,
    default: MarketplacePaymentStatus.PENDING,
  })
  paymentStatus: MarketplacePaymentStatus;

  @Column('decimal')
  totalAmount: number;

  @Column('jsonb')
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    imageUrl: string | null;
  }>;

  @Column({ type: 'varchar', unique: true, length: 4, nullable: true })
  pickupCode: string | null;

  @Column({ type: 'text', nullable: true })
  paymentProofUrl: string | null;

  @Column({ type: 'timestamp', nullable: true })
  paymentSubmittedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  verifiedBy: User | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
