import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventType } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
