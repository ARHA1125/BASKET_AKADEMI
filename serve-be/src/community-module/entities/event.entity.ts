import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Squad } from './squad.entity';

export enum EventType {
  TOURNAMENT = 'TOURNAMENT',
  SPARRING = 'SPARRING',
  TRYOUT = 'TRYOUT',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: EventType, default: EventType.TOURNAMENT })
  type: EventType;

  @Column()
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => Squad, (squad) => squad.event)
  squads: Squad[];

  @CreateDateColumn()
  createdAt: Date;
}
