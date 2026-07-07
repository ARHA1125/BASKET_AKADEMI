import { IsString, IsOptional, IsEnum } from 'class-validator';
import { FeedbackStatus } from '../entities/system-feedback.entity';

export class UpdateSystemFeedbackDto {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}
