import { Module } from '@nestjs/common';
import { ChatModuleService } from './chat-module.service';
import { ChatModuleController } from './chat-module.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatModuleController],
  providers: [ChatModuleService, ChatGateway],
})
export class ChatModuleModule {}
