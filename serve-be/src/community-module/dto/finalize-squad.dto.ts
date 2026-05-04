import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class FinalizeSquadDto {
  @IsUUID()
  squadId: string;

  @IsBoolean()
  @IsOptional()
  isFinalized?: boolean;

  @IsString()
  @IsOptional()
  awardedBy?: string;
}
