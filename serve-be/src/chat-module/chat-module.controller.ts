import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatModuleService } from './chat-module.service';
import { CreateChatModuleDto } from './dto/create-chat-module.dto';
import { UpdateChatModuleDto } from './dto/update-chat-module.dto';

@Controller('chat-module')
export class ChatModuleController {
  constructor(private readonly chatModuleService: ChatModuleService) {}

  @Post()
  create(@Body() createChatModuleDto: CreateChatModuleDto) {
    return this.chatModuleService.create(createChatModuleDto);
  }

  @Get()
  findAll() {
    return this.chatModuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatModuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatModuleDto: UpdateChatModuleDto) {
    return this.chatModuleService.update(+id, updateChatModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatModuleService.remove(+id);
  }
}
