import { Test, TestingModule } from '@nestjs/testing';
import { AuthsModuleService } from './auths-module.service';

describe('AuthsModuleService', () => {
  let service: AuthsModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthsModuleService],
    }).compile();

    service = module.get<AuthsModuleService>(AuthsModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
