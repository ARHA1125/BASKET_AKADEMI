import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationRulesService } from './notification-rules.service';
import { NotificationRule } from './entities/notification-rule.entity';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Controller('notification-rules')
export class NotificationRulesController {
  constructor(private readonly rulesService: NotificationRulesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createRuleDto: Partial<NotificationRule>) {
    return this.rulesService.create(createRuleDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.rulesService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRuleDto: Partial<NotificationRule>) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }
}
