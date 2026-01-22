import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityModuleService } from './community-module.service';
import { CreateCommunityModuleDto } from './dto/create-community-module.dto';
import { UpdateCommunityModuleDto } from './dto/update-community-module.dto';

@Controller('community-module')
export class CommunityModuleController {
  constructor(private readonly communityModuleService: CommunityModuleService) {}

  @Post()
  create(@Body() createCommunityModuleDto: CreateCommunityModuleDto) {
    return this.communityModuleService.create(createCommunityModuleDto);
  }

  @Get()
  findAll() {
    return this.communityModuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityModuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityModuleDto: UpdateCommunityModuleDto) {
    return this.communityModuleService.update(+id, updateCommunityModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityModuleService.remove(+id);
  }
}
