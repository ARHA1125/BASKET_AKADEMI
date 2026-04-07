import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlayerAssessmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  weekMaterialId: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  coachNote?: string;
}