import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { StudentActivityType } from '../entities/student-activity.entity';

export class CreateStudentActivityDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(StudentActivityType)
  activityType: StudentActivityType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sourceRefId?: string;

  @IsString()
  @IsOptional()
  sourceRefType?: string;

  @IsInt()
  @IsOptional()
  performanceValue?: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
