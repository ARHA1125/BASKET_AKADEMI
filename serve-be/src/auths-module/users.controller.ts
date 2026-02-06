import { 
    Controller, 
    Get, 
    Patch, 
    Param, 
    Body, 
    UseGuards, 
    Query, 
    Post, 
    UseInterceptors, 
    UploadedFile, 
    BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthsModuleService } from './auths-module.service'; // We'll extend service
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './jwt.auth-module.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly authsService: AuthsModuleService) {}

  @Get()
  // @Roles(UserRole.ADMIN) 
  findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search = '') {
    return this.authsService.findAllUsers(Number(page), Number(limit), search);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authsService.updateUser(id, updateUserDto);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const type = req.query.type as string;
        const uploadDir = process.env.UPLOAD_DIR || './img';
        let folderName = 'student'; // Default
        
        if (type === 'parent') {
           folderName = 'parent';
        } else if (type === 'coach') {
           folderName = 'coach';
        }

        const folder = `${uploadDir}/profile/${folderName}`;

        // Ensure directory exists
        fs.mkdirSync(folder, { recursive: true });
        
        cb(null, folder);
      },
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
  async uploadPhoto(
      @Param('id') id: string, 
      @UploadedFile() file: Express.Multer.File,
      @Query('type') type: string
  ) {
    if (!file) {
      throw new BadRequestException('File is not an image');
    }
    
    // Determine path based on type same as destination logic
    let folderName = 'student';
    if (type === 'parent') folderName = 'parent';
    if (type === 'coach') folderName = 'coach';

    const photoUrl = `/img/profile/${folderName}/${file.filename}`;
    return this.authsService.updateProfileImage(id, photoUrl);
  }
}
