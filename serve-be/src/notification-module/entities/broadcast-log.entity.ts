import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum BroadcastStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity()
export class BroadcastLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  templateContent: string;

  @Column()
  totalRecipients: number;

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  failedCount: number;

  @Column({ type: 'enum', enum: BroadcastStatus, default: BroadcastStatus.QUEUED })
  status: BroadcastStatus;

  @CreateDateColumn()
  createdAt: Date;
}
