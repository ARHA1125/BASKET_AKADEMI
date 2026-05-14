import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTrainingClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsString()
  @IsOptional()
  ageClass?: string;

  @IsUUID()
  @IsOptional()
  coachId?: string;

  @IsUUID()
  @IsOptional()
  curriculumLevelId?: string;

  @IsUUID()
  @IsOptional()
  activeMonthId?: string;
}
