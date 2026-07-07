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
  ForbiddenException,
} from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';
import { JwtAuthGuard } from '../auths-module/jwt.auth-module.guard';

@Controller('administration/testimonials')
@UseGuards(JwtAuthGuard)
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Post()
  create(@Request() req, @Body() createTestimonialDto: CreateTestimonialDto) {
    const user = req.user;
    if (user.role === UserRole.PARENT) {
      return this.testimonialService.createForParent(user.id, createTestimonialDto);
    } else if (user.role === UserRole.ADMIN) {
      return this.testimonialService.createForParentByAdmin(createTestimonialDto);
    } else {
      throw new ForbiddenException('Only parents and admins can create testimonials');
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.testimonialService.findAll();
  }

  @Get('my')
  @Roles(UserRole.PARENT)
  findMy(@Request() req) {
    return this.testimonialService.findMyTestimonial(req.user.id);
  }

  @Public()
  @Get('public')
  findPublic() {
    return this.testimonialService.findPublicApproved();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ) {
    return this.testimonialService.update(id, updateTestimonialDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.testimonialService.remove(id, req.user);
  }
}
