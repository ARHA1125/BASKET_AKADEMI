import { Test, TestingModule } from '@nestjs/testing';
import { AuthsModuleController } from './auths-module.controller';
import { AuthsModuleService } from './auths-module.service';

describe('AuthsModuleController', () => {
  let controller: AuthsModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthsModuleController],
      providers: [AuthsModuleService],
    }).compile();

    controller = module.get<AuthsModuleController>(AuthsModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
