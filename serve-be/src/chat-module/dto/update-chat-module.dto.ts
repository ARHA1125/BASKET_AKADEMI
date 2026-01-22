import { PartialType } from '@nestjs/mapped-types';
import { CreateChatModuleDto } from './create-chat-module.dto';

export class UpdateChatModuleDto extends PartialType(CreateChatModuleDto) {}
