import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  StudentAgeClass,
  StudentCurriculumProfile,
} from '../entities/student.entity';

export class CreateUnifiedStudentDto {
  // --- User Fields ---
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  // --- Student Profile Fields ---
  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(StudentAgeClass)
  @IsOptional()
  ageClass?: StudentAgeClass;

  @IsEnum(StudentCurriculumProfile)
  @IsOptional()
  curriculumProfile?: StudentCurriculumProfile;

  // --- Relationships ---
  @IsEmail()
  @IsOptional()
  parentEmail?: string;
}
