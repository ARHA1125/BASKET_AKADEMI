import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auths-module/entities/user.entity';
import { CurriculumWeekMaterial } from './curriculum-week-material.entity';

@Entity('coach_material_notes')
export class CoachMaterialNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coachId' })
  coach: User;

  @Column('uuid')
  coachId: string;

  @ManyToOne(() => CurriculumWeekMaterial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'weekMaterialId' })
  weekMaterial: CurriculumWeekMaterial;

  @Column('uuid')
  weekMaterialId: string;

  @Column('text', { nullable: true })
  customNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
