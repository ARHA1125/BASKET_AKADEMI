import { Injectable } from '@nestjs/common';
import { CreateCommunityModuleDto } from './dto/create-community-module.dto';
import { UpdateCommunityModuleDto } from './dto/update-community-module.dto';

@Injectable()
export class CommunityModuleService {
  create(createCommunityModuleDto: CreateCommunityModuleDto) {
    return 'This action adds a new communityModule';
  }

  findAll() {
    return `This action returns all communityModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityModule`;
  }

  update(id: number, updateCommunityModuleDto: UpdateCommunityModuleDto) {
    return `This action updates a #${id} communityModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityModule`;
  }
}
