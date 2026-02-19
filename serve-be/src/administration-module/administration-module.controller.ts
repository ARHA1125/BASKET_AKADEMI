import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdministrationService } from './administration-module.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('administration/sponsors')
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'agreementDoc', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './img/sponsors';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(
    @UploadedFiles() files: { logo?: Express.Multer.File[], agreementDoc?: Express.Multer.File[] },
    @Body() createSponsorDto: CreateSponsorDto
  ) {
    if (files.logo && files.logo[0]) {
      createSponsorDto.logoUrl = `/img/sponsors/${files.logo[0].filename}`;
    }
    if (files.agreementDoc && files.agreementDoc[0]) {
      createSponsorDto.agreementDocUrl = `/img/sponsors/${files.agreementDoc[0].filename}`;
    }
    return this.administrationService.create(createSponsorDto);
  }

  @Get()
  findAll() {
    return this.administrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administrationService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'agreementDoc', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './img/sponsors';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  update(
    @Param('id') id: string, 
    @UploadedFiles() files: { logo?: Express.Multer.File[], agreementDoc?: Express.Multer.File[] },
    @Body() updateSponsorDto: UpdateSponsorDto
  ) {
    if (files.logo && files.logo[0]) {
      updateSponsorDto.logoUrl = `/img/sponsors/${files.logo[0].filename}`;
    }
    if (files.agreementDoc && files.agreementDoc[0]) {
      updateSponsorDto.agreementDocUrl = `/img/sponsors/${files.agreementDoc[0].filename}`;
    }
    return this.administrationService.update(id, updateSponsorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administrationService.remove(id);
  }
}
