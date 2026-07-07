import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SystemFeedbackService } from './system-feedback.service';
import { CreateSystemFeedbackDto } from './dto/create-system-feedback.dto';
import { UpdateSystemFeedbackDto } from './dto/update-system-feedback.dto';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';
import { JwtAuthGuard } from '../auths-module/jwt.auth-module.guard';

@Controller('administration/feedbacks')
@UseGuards(JwtAuthGuard)
export class SystemFeedbackController {
  constructor(private readonly feedbackService: SystemFeedbackService) {}

  @Post()
  @Roles(UserRole.PARENT, UserRole.STUDENT)
  create(@Request() req, @Body() dto: CreateSystemFeedbackDto) {
    return this.feedbackService.create(req.user, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get('my')
  @Roles(UserRole.PARENT, UserRole.STUDENT)
  findMy(@Request() req) {
    return this.feedbackService.findMyFeedbacks(req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSystemFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
