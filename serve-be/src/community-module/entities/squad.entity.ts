import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Student } from '../../academic-module/entities/student.entity';

export enum SquadStatus {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
}

@Entity()
export class Squad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Team Alpha"

  @ManyToOne(() => Event, (event) => event.squads)
  event: Event;

  // Use ManyToMany for players in a squad
  @ManyToMany(() => Student)
  @JoinTable()
  players: Student[];

  @Column({ nullable: true })
  coachName: string; // Or relation to User(Coach)

  @Column({ default: false })
  isFinalized: boolean;

  @Column({ type: 'enum', enum: SquadStatus, default: SquadStatus.DRAFT })
  status: SquadStatus;

  @Column({ type: 'timestamp', nullable: true })
  finalizedAt: Date;

  @Column({ nullable: true })
  finalizedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
