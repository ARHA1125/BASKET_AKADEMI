import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationDeliveryKind {
  INVOICE = 'INVOICE',
  MANUAL_LATE_INVOICE = 'MANUAL_LATE_INVOICE',
  REMINDER = 'REMINDER',
  ACCEPTANCE = 'ACCEPTANCE',
  BROADCAST = 'BROADCAST',
}

export enum NotificationDeliveryStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  ACKED = 'ACKED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

@Entity()
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationDeliveryKind })
  kind: NotificationDeliveryKind;

  @Column({
    type: 'enum',
    enum: NotificationDeliveryStatus,
    default: NotificationDeliveryStatus.QUEUED,
  })
  status: NotificationDeliveryStatus;

  @Column()
  recipientChatId: string;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string | null;

  @Column({ type: 'uuid', nullable: true })
  broadcastLogId: string | null;

  @Column({ type: 'text', nullable: true })
  externalMessageId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  ackedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
