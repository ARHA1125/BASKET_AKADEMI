import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { User } from '../../auths-module/entities/user.entity';
import { CurriculumLevel } from './curriculum-level.entity';
import { CurriculumMonth } from './curriculum-month.entity';

@Entity()
export class TrainingClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. U-12, Rookie Class

  @Column({ nullable: true })
  schedule: string; // e.g. "Mon, Wed 16:00"

  @OneToMany(() => Student, (student) => student.trainingClass)
  students: Student[];

  @ManyToOne(() => User, (user) => user.coachedClasses, { nullable: true })
  coach: User; 

  @ManyToOne(() => CurriculumLevel, { nullable: true })
  curriculumLevel: CurriculumLevel;

  @ManyToOne(() => CurriculumMonth, { nullable: true })
  activeMonth: CurriculumMonth;
}
