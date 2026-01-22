import { IsString, IsEmail, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class PublicApplicationDto {
  @IsString()
  parentName: string;

  @IsEmail()
  parentEmail: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;

  @IsString()
  studentName: string;

  @IsOptional()
  @IsEmail()
  studentEmail?: string;

  @IsDateString()
  studentDob: string;

  @IsOptional()
  @IsNumber()
  studentHeight?: number;

  @IsOptional()
  @IsNumber()
  studentWeight?: number;

  @IsOptional()
  @IsString()
  studentPosition?: string;
}
