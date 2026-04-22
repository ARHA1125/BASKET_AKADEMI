import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSquadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  eventId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  playerIds: string[];

  @IsString()
  @IsOptional()
  coachName?: string;

  @IsBoolean()
  @IsOptional()
  isFinalized?: boolean;
}
