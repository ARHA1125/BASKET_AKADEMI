import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

export enum StudentActivityType {
  ATTENDANCE = 'ATTENDANCE',
  PUNCTUALITY = 'PUNCTUALITY',
  DRILL_COMPLETION = 'DRILL_COMPLETION',
  MINI_GAME = 'MINI_GAME',
  SKILL_PROGRESS = 'SKILL_PROGRESS',
  DISCIPLINE = 'DISCIPLINE',
  TEAMWORK = 'TEAMWORK',
  COACH_FEEDBACK = 'COACH_FEEDBACK',
  LINEUP_SELECTION = 'LINEUP_SELECTION',
  EVENT_PARTICIPATION = 'EVENT_PARTICIPATION',
}

@Entity('student_activities')
export class StudentActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column({ type: 'enum', enum: StudentActivityType })
  activityType: StudentActivityType;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  sourceRefId: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sourceRefType: string;

  @Column({ type: 'int', nullable: true })
  performanceValue: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
