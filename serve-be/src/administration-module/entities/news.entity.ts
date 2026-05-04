import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('news')
export class News {
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
  image: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column()
  author: string;

  @Column({ default: '5 min read' })
  readTime: string;

  @Column({ type: 'text' })
  content: string; // JSON-serialized NewsContentBlock[]

  @Column({ default: 'draft' })
  status: string; // 'draft' | 'published'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
