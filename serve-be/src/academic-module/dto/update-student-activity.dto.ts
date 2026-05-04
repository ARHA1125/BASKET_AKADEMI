import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StudentActivityType } from '../entities/student-activity.entity';

export class UpdateStudentActivityDto {
  @IsEnum(StudentActivityType)
  @IsOptional()
  activityType?: StudentActivityType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
