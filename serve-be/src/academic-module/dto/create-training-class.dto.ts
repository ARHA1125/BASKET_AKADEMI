import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTrainingClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsUUID()
  @IsOptional()
  coachId?: string;
}