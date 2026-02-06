import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Student } from '../../academic-module/entities/student.entity';
import { Parent } from '../../academic-module/entities/parent.entity';
import { Transaction } from './transaction.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { nullable: true })
  student: Student;

  @ManyToOne(() => Parent, { nullable: true }) 
  parent: Parent;

  @Column('decimal')
  amount: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.UNPAID })
  status: InvoiceStatus;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  paymentLink: string;
  
  @Column({ nullable: true })
  photo_url: string;


  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'int', nullable: true })
  uniqueCode: number;

  @Column({ type: 'decimal', nullable: true })
  uniqueAmount: number;

  @Column({ type: 'enum', enum: ['TRANSFER', 'CASH'], nullable: true })
  paymentMethod: 'TRANSFER' | 'CASH';

  @Column({ nullable: true })
  month: string;

  @Column({ type: 'enum', enum: ['SUDAH_TERKIRIM', 'BELUM_TERKIRIM'], default: 'BELUM_TERKIRIM' })
  deliveryStatus: 'SUDAH_TERKIRIM' | 'BELUM_TERKIRIM';

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Transaction, (transaction) => transaction.invoice)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
