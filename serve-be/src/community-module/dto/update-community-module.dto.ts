import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityModuleDto } from './create-community-module.dto';

export class UpdateCommunityModuleDto extends PartialType(CreateCommunityModuleDto) {}
