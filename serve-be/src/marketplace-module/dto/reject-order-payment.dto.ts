import { IsOptional, IsString } from 'class-validator';

export class RejectOrderPaymentDto {
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
