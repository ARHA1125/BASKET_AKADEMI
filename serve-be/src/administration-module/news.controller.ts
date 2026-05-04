import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const newsStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './img/news';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `news-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('administration/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'coverImage', maxCount: 1 }], {
      storage: newsStorage,
    }),
  )
  create(
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
    @Body() createNewsDto: CreateNewsDto,
  ) {
    if (files?.coverImage && files.coverImage[0]) {
      createNewsDto.image = `/img/news/${files.coverImage[0].filename}`;
    }
    return this.newsService.create(createNewsDto);
  }

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Public()
  @Get('published')
  findPublished() {
    return this.newsService.findPublished();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'coverImage', maxCount: 1 }], {
      storage: newsStorage,
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    if (files?.coverImage && files.coverImage[0]) {
      updateNewsDto.image = `/img/news/${files.coverImage[0].filename}`;
    }
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  // Upload image for content blocks (returns the image URL)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', { storage: newsStorage }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/img/news/${file.filename}` };
  }
}
