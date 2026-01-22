import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsUUID()
  @IsOptional()
  trainingClassId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  height?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  position?: string;
}