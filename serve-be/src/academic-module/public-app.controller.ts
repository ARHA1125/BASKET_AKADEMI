import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PublicAppService } from './public-app.service';
import { PublicApplicationDto } from './dto/public-application.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('public')
export class PublicAppController {
  constructor(private readonly publicAppService: PublicAppService) {}

  @Public()
  @Post('apply')
  async apply(@Body() dto: PublicApplicationDto) {
    return this.publicAppService.processApplication(dto);
  }

  @Public()
  @Get('check-duplicate')
  async checkDuplicate(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    return this.publicAppService.checkDuplicate(email, phone);
  }
}
