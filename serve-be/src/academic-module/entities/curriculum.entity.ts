import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CurriculumLevel {
  ROOKIE = 'ROOKIE',
  STARTER = 'STARTER',
  ALL_STAR = 'ALL_STAR',
  MVP = 'MVP',
}

@Entity()
export class Curriculum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CurriculumLevel, default: CurriculumLevel.ROOKIE })
  level: CurriculumLevel;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
