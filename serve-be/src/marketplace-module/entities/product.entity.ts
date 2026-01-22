import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column('int')
  stock: number; // For simple inventory. For variants, need separate entity.

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  category: string; // Jersey, Ball, etc.

  @CreateDateColumn()
  createdAt: Date;
}
