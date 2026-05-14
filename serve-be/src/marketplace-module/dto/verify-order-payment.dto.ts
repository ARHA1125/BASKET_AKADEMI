import { IsOptional, IsString } from 'class-validator';

export class VerifyOrderPaymentDto {
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
