import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Student } from '../../academic-module/entities/student.entity';
import { Parent } from '../../academic-module/entities/parent.entity';
import { Order } from '../../marketplace-module/entities/order.entity';
import { TrainingClass } from '../../academic-module/entities/training-class.entity';
import { Coach } from '../../academic-module/entities/coach.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: 'Active' })
  status: string; // 'Active' | 'Pending' | 'Inactive'

  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  photo_url: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToOne(() => Student, (student) => student.user, { nullable: true })
  studentProfile: Student;

  @OneToOne(() => Parent, (parent) => parent.user, { nullable: true })
  parentProfile: Parent;

  @OneToOne(() => Coach, (coach) => coach.user, { nullable: true })
  coachProfile: Coach;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => TrainingClass, (trainingClass) => trainingClass.coach)
  coachedClasses: TrainingClass[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
