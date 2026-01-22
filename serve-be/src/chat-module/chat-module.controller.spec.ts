import { Test, TestingModule } from '@nestjs/testing';
import { ChatModuleController } from './chat-module.controller';
import { ChatModuleService } from './chat-module.service';

describe('ChatModuleController', () => {
  let controller: ChatModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatModuleController],
      providers: [ChatModuleService],
    }).compile();

    controller = module.get<ChatModuleController>(ChatModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
