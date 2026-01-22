import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCoachDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @IsOptional()
  @IsString()
  certification?: string;
}
