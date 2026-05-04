import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';
import { Parent } from './parent.entity';
import { TrainingClass } from './training-class.entity';
import { PlayerAssessment } from './player-assessment.entity';
import { Attendance } from './attendance.entity';
import { Invoice } from '../../payment-module/entities/invoice.entity';

export enum StudentAgeClass {
  KU_10 = 'KU-10',
  KU_12 = 'KU-12',
  KU_14 = 'KU-14',
  KU_17 = 'KU-17',
}

export enum StudentCurriculumProfile {
  KU_10 = 'KU-10',
  KU_12 = 'KU-12',
  KU_14 = 'KU-14',
  KU_17 = 'KU-17',
}

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.studentProfile)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Parent, (parent) => parent.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Parent;

  @ManyToOne(() => TrainingClass, (trainingClass) => trainingClass.students, {
    nullable: true,
  })
  trainingClass: TrainingClass;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  position: string;

  @Column({
    type: 'enum',
    enum: StudentAgeClass,
    nullable: true,
  })
  ageClass: StudentAgeClass;

  @Column({
    type: 'enum',
    enum: StudentCurriculumProfile,
    nullable: true,
  })
  curriculumProfile: StudentCurriculumProfile;

  @OneToMany(() => PlayerAssessment, (assessment) => assessment.student)
  assessments: PlayerAssessment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => Invoice, (invoice) => invoice.student)
  invoices: Invoice[];
}
