import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TemplateType {
  INVOICE = 'INVOICE',
  EVENT = 'EVENT',
  CUSTOM = 'CUSTOM',
}

@Entity()
export class MessageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: TemplateType, default: TemplateType.CUSTOM })
  type: TemplateType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
