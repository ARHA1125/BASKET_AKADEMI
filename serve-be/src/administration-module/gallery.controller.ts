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
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const galleryStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './img/gallery';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `gallery-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('administration/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'coverImage', maxCount: 1 }], {
      storage: galleryStorage,
    }),
  )
  create(
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
    @Body() dto: CreateGalleryDto,
  ) {
    if (files?.coverImage && files.coverImage[0]) {
      dto.cover = `/img/gallery/${files.coverImage[0].filename}`;
    }
    return this.galleryService.create(dto);
  }

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Public()
  @Get('published')
  findPublished() {
    return this.galleryService.findPublished();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.galleryService.findBySlug(slug);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'coverImage', maxCount: 1 }], {
      storage: galleryStorage,
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
    @Body() dto: UpdateGalleryDto,
  ) {
    if (files?.coverImage && files.coverImage[0]) {
      dto.cover = `/img/gallery/${files.coverImage[0].filename}`;
    }
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  // Upload photo for album
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo', { storage: galleryStorage }))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    return { url: `/img/gallery/${file.filename}` };
  }
}
