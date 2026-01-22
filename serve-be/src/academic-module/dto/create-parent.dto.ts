import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateParentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}