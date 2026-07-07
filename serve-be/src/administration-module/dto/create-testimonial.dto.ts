import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  content: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
