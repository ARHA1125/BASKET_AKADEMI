import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlayerAssessmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  speed: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  shooting: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  passing: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  dribbling: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  defense: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  physical: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  overallRating: number;

  @IsString()
  @IsOptional()
  coachNote?: string;
}