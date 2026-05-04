import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { CurriculumWeekMaterial } from './curriculum-week-material.entity';

export enum AssessmentStatus {
  NEEDS_WORK = 'Needs Work',
  SATISFACTORY = 'Satisfactory',
  MASTERED = 'Mastered',
}

@Entity()
export class PlayerAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.assessments, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => CurriculumWeekMaterial, (material) => material.assessments, {
    onDelete: 'CASCADE',
  })
  weekMaterial: CurriculumWeekMaterial;

  @Column({ type: 'varchar', length: 50, default: AssessmentStatus.NEEDS_WORK })
  status: AssessmentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  curriculumProfile: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ageClass: string;

  @Column({ type: 'smallint', default: 1 })
  score: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  assessorName: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  dominantStat: string;

  @Column({ type: 'int', default: 0 })
  speedScore: number;

  @Column({ type: 'int', default: 0 })
  shootingScore: number;

  @Column({ type: 'int', default: 0 })
  passingScore: number;

  @Column({ type: 'int', default: 0 })
  dribblingScore: number;

  @Column({ type: 'int', default: 0 })
  defenseScore: number;

  @Column({ type: 'int', default: 0 })
  physicalScore: number;

  @Column({ type: 'int', default: 0 })
  consistencyScore: number;

  @Column({ type: 'int', default: 0 })
  overallRating: number;

  @Column('text', { nullable: true })
  coachNote: string;

  @CreateDateColumn()
  assessedAt: Date;
}
