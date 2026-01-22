import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUnifiedCoachDto {
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

    // --- Coach Profile Fields ---
    @IsString()
    @IsOptional()
    specialization?: string;

    @IsString()
    @IsOptional()
    contractStatus?: string;

    @IsString()
    @IsOptional()
    bio?: string;
    
    @IsNumber()
    @IsOptional()
    yearsOfExperience?: number;
    
    @IsString()
    @IsOptional()
    certification?: string;
    
    @IsNumber()
    @IsOptional()
    hourlyRate?: number;
}
