import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AwardPointsDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsOptional()
  activityId?: string;

  @IsInt()
  points: number;

  @IsString()
  @IsNotEmpty()
  ruleCode: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  awardedBy?: string;
}
