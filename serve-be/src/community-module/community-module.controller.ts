import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommunityModuleService } from './community-module.service';
import { CreateCommunityModuleDto } from './dto/create-community-module.dto';
import { UpdateCommunityModuleDto } from './dto/update-community-module.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateSquadDto } from './dto/create-squad.dto';
import { FinalizeSquadDto } from './dto/finalize-squad.dto';

@Controller('community-module')
export class CommunityModuleController {
  constructor(
    private readonly communityModuleService: CommunityModuleService,
  ) {}

  @Post()
  create(@Body() createCommunityModuleDto: CreateCommunityModuleDto) {
    return this.communityModuleService.create(createCommunityModuleDto);
  }

  @Post('events')
  createEvent(@Body() dto: CreateEventDto) {
    return this.communityModuleService.createEvent(dto);
  }

  @Get('events')
  findAllEvents() {
    return this.communityModuleService.findAllEvents();
  }

  @Post('squads')
  createSquad(@Body() dto: CreateSquadDto) {
    return this.communityModuleService.createSquad(dto);
  }

  @Get('squads')
  findAllSquads() {
    return this.communityModuleService.findAllSquads();
  }

  @Get('squads/:id')
  findOneSquad(@Param('id') id: string) {
    return this.communityModuleService.findOneSquad(id);
  }

  @Post('squads/finalize')
  finalizeSquad(@Body() dto: FinalizeSquadDto) {
    return this.communityModuleService.finalizeSquad(dto);
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
  update(
    @Param('id') id: string,
    @Body() updateCommunityModuleDto: UpdateCommunityModuleDto,
  ) {
    return this.communityModuleService.update(+id, updateCommunityModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityModuleService.remove(+id);
  }
}
