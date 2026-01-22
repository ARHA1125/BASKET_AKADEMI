import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.transactions)
  invoice: Invoice;

  @Column('decimal')
  amount: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ nullable: true })
  paymentMethod: string; // e.g., 'BANK_TRANSFER', 'QRIS'

  @Column({ nullable: true })
  providerTransactionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
