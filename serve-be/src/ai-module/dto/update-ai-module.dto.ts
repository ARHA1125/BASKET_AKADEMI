import { PartialType } from '@nestjs/mapped-types';
import { CreateAiModuleDto } from './create-ai-module.dto';

export class UpdateAiModuleDto extends PartialType(CreateAiModuleDto) {}
