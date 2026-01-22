import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity()
export class PlayerAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.assessments)
  student: Student;

  @Column('int')
  speed: number;

  @Column('int')
  shooting: number;

  @Column('int')
  passing: number;

  @Column('int')
  dribbling: number;

  @Column('int')
  defense: number;

  @Column('int')
  physical: number;

  @Column('int')
  overallRating: number;

  @Column('text', { nullable: true })
  coachNote: string;

  @CreateDateColumn()
  assessedAt: Date;
}
