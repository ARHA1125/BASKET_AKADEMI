import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CurriculumMonth } from './curriculum-month.entity';

@Entity('curriculum_levels')
export class CurriculumLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., 'Dasar', 'Menengah', 'Lanjutan'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  colorCode: string; // e.g., 'blue', 'yellow', 'green'

  @OneToMany(() => CurriculumMonth, (month) => month.level)
  months: CurriculumMonth[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
