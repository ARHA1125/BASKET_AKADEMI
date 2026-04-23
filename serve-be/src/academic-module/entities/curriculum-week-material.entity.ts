import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CurriculumMonth } from './curriculum-month.entity';
import { PlayerAssessment } from './player-assessment.entity';

export enum CurriculumStatDomain {
  SPEED = 'SPD',
  SHOOTING = 'SHO',
  PASSING = 'PAS',
  DRIBBLING = 'DRI',
  DEFENSE = 'DEF',
  PHYSICAL = 'PHY',
  CHARACTER = 'CHR',
}

@Entity('curriculum_week_materials')
export class CurriculumWeekMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  weekNumber: number; // 1 to 4

  @Column({ type: 'varchar', length: 150 })
  category: string; // e.g., "Dasar Body Control", "Passing & Catching"

  @Column({ type: 'text' })
  materialDescription: string; // e.g., "Keseimbangan dalam berhenti dari posisi lari", "Stance, Start, Step"

  @Column({ type: 'varchar', length: 120, nullable: true })
  competencyKey: string;

  @Column({
    type: 'enum',
    enum: CurriculumStatDomain,
    nullable: true,
  })
  statDomain: CurriculumStatDomain;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  statWeight: number;

  @Column({ type: 'simple-array', nullable: true })
  curriculumProfiles: string[];

  @ManyToOne(() => CurriculumMonth, (month) => month.weekMaterials, {
    onDelete: 'CASCADE',
  })
  month: CurriculumMonth;

  @OneToMany(() => PlayerAssessment, (assessment) => assessment.weekMaterial)
  assessments: PlayerAssessment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
