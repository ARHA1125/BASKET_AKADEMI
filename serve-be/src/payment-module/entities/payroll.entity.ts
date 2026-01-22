import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Coach } from '../../academic-module/entities/coach.entity';

export enum PayrollStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
}

@Entity()
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coach)
  coach: Coach;

  @Column()
  period: string; // e.g., "2023-10"

  @Column()
  totalSessions: number;

  @Column('decimal')
  amount: number;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.PENDING })
  status: PayrollStatus;

  @CreateDateColumn()
  createdAt: Date;
}
