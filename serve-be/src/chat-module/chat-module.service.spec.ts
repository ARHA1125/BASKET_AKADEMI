import { Test, TestingModule } from '@nestjs/testing';
import { ChatModuleService } from './chat-module.service';

describe('ChatModuleService', () => {
  let service: ChatModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatModuleService],
    }).compile();

    service = module.get<ChatModuleService>(ChatModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
