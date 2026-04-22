import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

export enum BadgeCode {
  LINEUP_LEGEND = 'LINEUP_LEGEND',
  MATCH_READY = 'MATCH_READY',
  TRAINING_ENGINE = 'TRAINING_ENGINE',
  SKILL_MASTERY = 'SKILL_MASTERY',
  DISCIPLINE_LOCK = 'DISCIPLINE_LOCK',
  TEAM_SPIRIT = 'TEAM_SPIRIT',
  TOP_PLAYER = 'TOP_PLAYER',
  TOP_THREE = 'TOP_THREE',
  LINEUP_PICK = 'LINEUP_PICK',
  EVENT_READY = 'EVENT_READY',
  TRAINING_STREAK = 'TRAINING_STREAK',
  ELITE_OVR = 'ELITE_OVR',
}

@Entity('student_badges')
export class StudentBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column({ type: 'enum', enum: BadgeCode })
  badgeCode: BadgeCode;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  categoryKey: string;

  @Column({ type: 'int', nullable: true })
  tier: number;

  @Column({ type: 'int', nullable: true })
  progressPoints: number;

  @Column({ type: 'int', nullable: true })
  targetPoints: number;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'varchar', length: 40, nullable: true })
  sourceType: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  sourceRefId: string;

  @CreateDateColumn()
  awardedAt: Date;
}
