import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiModuleService } from './ai-module.service';
import { CreateAiModuleDto } from './dto/create-ai-module.dto';
import { UpdateAiModuleDto } from './dto/update-ai-module.dto';

@Controller('ai-module')
export class AiModuleController {
  constructor(private readonly aiModuleService: AiModuleService) {}

  @Post()
  create(@Body() createAiModuleDto: CreateAiModuleDto) {
    return this.aiModuleService.create(createAiModuleDto);
  }

  @Get()
  findAll() {
    return this.aiModuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiModuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiModuleDto: UpdateAiModuleDto) {
    return this.aiModuleService.update(+id, updateAiModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiModuleService.remove(+id);
  }
}
