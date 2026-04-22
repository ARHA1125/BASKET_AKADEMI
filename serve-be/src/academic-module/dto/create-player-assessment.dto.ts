import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AssessmentStatus } from '../entities/player-assessment.entity';

export class CreatePlayerAssessmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  weekMaterialId: string;

  @IsEnum(AssessmentStatus)
  @IsOptional()
  status?: AssessmentStatus;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  assessorName?: string;

  @IsString()
  @IsOptional()
  coachNote?: string;
}
