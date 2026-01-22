import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';
import { Student } from './student.entity';
import { Invoice } from '../../payment-module/entities/invoice.entity';

@Entity()
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.parentProfile)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToMany(() => Student, (student) => student.parent)
  students: Student[];

  @OneToMany(() => Invoice, (invoice) => invoice.parent)
  invoices: Invoice[];
}
