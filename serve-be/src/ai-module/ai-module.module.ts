import { Module } from '@nestjs/common';
import { AiModuleService } from './ai-module.service';
import { AiModuleController } from './ai-module.controller';

@Module({
  controllers: [AiModuleController],
  providers: [AiModuleService],
})
export class AiModuleModule {}
