import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CurriculumLevel } from './curriculum-level.entity';
import { CurriculumWeekMaterial } from './curriculum-week-material.entity';

@Entity('curriculum_months')
export class CurriculumMonth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  monthNumber: number; // 1 to 6

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string; // e.g., "Bulan Pertama", "Bulan Kedua"

  @ManyToOne(() => CurriculumLevel, (level) => level.months, { onDelete: 'CASCADE' })
  level: CurriculumLevel;

  @OneToMany(() => CurriculumWeekMaterial, (weekMaterial) => weekMaterial.month)
  weekMaterials: CurriculumWeekMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
