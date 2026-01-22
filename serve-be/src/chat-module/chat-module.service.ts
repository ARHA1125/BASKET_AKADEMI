import { Injectable } from '@nestjs/common';
import { CreateChatModuleDto } from './dto/create-chat-module.dto';
import { UpdateChatModuleDto } from './dto/update-chat-module.dto';

@Injectable()
export class ChatModuleService {
  create(createChatModuleDto: CreateChatModuleDto) {
    return 'This action adds a new chatModule';
  }

  findAll() {
    return `This action returns all chatModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatModule`;
  }

  update(id: number, updateChatModuleDto: UpdateChatModuleDto) {
    return `This action updates a #${id} chatModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatModule`;
  }
}
