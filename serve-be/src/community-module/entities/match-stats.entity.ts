import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../../academic-module/entities/student.entity';
import { Event } from './event.entity';

@Entity()
export class MatchStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => Event)
  event: Event;

  @Column('int', { default: 0 })
  points: number;

  @Column('int', { default: 0 })
  assists: number;

  @Column('int', { default: 0 })
  rebounds: number;

  @Column('int', { default: 0 })
  steals: number;

  @Column('int', { default: 0 })
  blocks: number;

  @CreateDateColumn()
  gameDate: Date;
}
