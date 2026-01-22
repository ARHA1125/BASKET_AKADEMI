import { Injectable } from '@nestjs/common';
import { CreateAiModuleDto } from './dto/create-ai-module.dto';
import { UpdateAiModuleDto } from './dto/update-ai-module.dto';

@Injectable()
export class AiModuleService {
  create(createAiModuleDto: CreateAiModuleDto) {
    return 'This action adds a new aiModule';
  }

  findAll() {
    return `This action returns all aiModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiModule`;
  }

  update(id: number, updateAiModuleDto: UpdateAiModuleDto) {
    return `This action updates a #${id} aiModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiModule`;
  }
}
