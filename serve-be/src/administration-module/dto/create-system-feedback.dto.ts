import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { FeedbackCategory } from '../entities/system-feedback.entity';

export class CreateSystemFeedbackDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(FeedbackCategory)
  @IsNotEmpty()
  category: FeedbackCategory;
}
