import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';

@Entity()
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.coachProfile)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  experienceYears: number;

  @Column({ nullable: true })
  certification: string;

  @Column('decimal', { nullable: true })
  hourlyRate: number;

  @Column({ default: 'ACTIVE' }) // ACTIVE, INACTIVE, TERMINATED
  contractStatus: string;
}
