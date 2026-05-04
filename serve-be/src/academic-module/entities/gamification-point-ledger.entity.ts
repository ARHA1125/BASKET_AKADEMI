import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { StudentActivity } from './student-activity.entity';

@Entity('gamification_point_ledgers')
export class GamificationPointLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => StudentActivity, { nullable: true, onDelete: 'SET NULL' })
  activity: StudentActivity;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'varchar', length: 150 })
  ruleCode: string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 30 })
  weekKey: string;

  @Column({ type: 'varchar', length: 15 })
  seasonKey: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  awardedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
