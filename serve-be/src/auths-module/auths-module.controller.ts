import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor, Get, Request, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthsModuleService } from './auths-module.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthsModuleController {
  constructor(private readonly authsModuleService: AuthsModuleService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authsModuleService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authsModuleService.login(loginDto);
  }

  @Get('me')
  getProfile(@Request() req) {
    return this.authsModuleService.getProfile(req.user.id);
  }

  @Post('profile/image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './img/profile/student',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadProfileImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not an image');
    }
    const photoUrl = `/img/profile/student/${file.filename}`;
    return this.authsModuleService.updateProfileImage(req.user.id, photoUrl);
  }
}
