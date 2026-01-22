import { Test, TestingModule } from '@nestjs/testing';
import { CommunityModuleService } from './community-module.service';

describe('CommunityModuleService', () => {
  let service: CommunityModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityModuleService],
    }).compile();

    service = module.get<CommunityModuleService>(CommunityModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
