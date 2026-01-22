import { Test, TestingModule } from '@nestjs/testing';
import { AiModuleService } from './ai-module.service';

describe('AiModuleService', () => {
  let service: AiModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiModuleService],
    }).compile();

    service = module.get<AiModuleService>(AiModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
