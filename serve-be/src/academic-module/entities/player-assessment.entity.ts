import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { CurriculumWeekMaterial } from './curriculum-week-material.entity';

@Entity()
export class PlayerAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.assessments, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => CurriculumWeekMaterial, (material) => material.assessments, { onDelete: 'CASCADE' })
  weekMaterial: CurriculumWeekMaterial;

  @Column({ type: 'varchar', length: 50, default: 'Needs Work' })
  status: string; // e.g., 'Needs Work', 'Satisfactory', 'Mastered'

  @Column('text', { nullable: true })
  coachNote: string;

  @CreateDateColumn()
  assessedAt: Date;
}
