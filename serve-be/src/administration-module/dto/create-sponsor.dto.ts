import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  agreementDocUrl?: string;
}
