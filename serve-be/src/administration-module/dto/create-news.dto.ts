import { IsString, IsOptional } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  excerpt: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  readTime?: string;

  @IsString()
  content: string; // JSON stringified NewsContentBlock[]

  @IsString()
  @IsOptional()
  status?: string;
}
