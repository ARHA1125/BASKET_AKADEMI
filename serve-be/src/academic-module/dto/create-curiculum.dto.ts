import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CurriculumLevel } from '../entities/curriculum.entity';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CurriculumLevel)
  @IsOptional()
  level?: CurriculumLevel;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}