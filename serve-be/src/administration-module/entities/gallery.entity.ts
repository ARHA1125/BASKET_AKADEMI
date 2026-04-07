import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  photos: string; // JSON-serialized GalleryPhoto[]

  @Column({ default: 'draft' })
  status: string; // 'draft' | 'published'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
