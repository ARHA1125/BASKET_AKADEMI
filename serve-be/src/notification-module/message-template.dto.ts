import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { TemplateType } from './entities/message-template.entity';

export class CreateMessageTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateMessageTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
