import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Event } from './event.entity';
import { Student } from '../../academic-module/entities/student.entity';

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
}
