import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentModuleService } from './payment-module.service';
import { CreatePaymentModuleDto } from './dto/create-payment-module.dto';
import { UpdatePaymentModuleDto } from './dto/update-payment-module.dto';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';
import { Public } from '../common/decorators/public.decorator';
import { UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Roles(UserRole.ADMIN)
@Controller('payment-module')
export class PaymentModuleController {
  constructor(private readonly paymentModuleService: PaymentModuleService) {}

  @Get('invoices')
  findAllInvoices(@Query('filter') filter: 'current' | 'history') {
    return this.paymentModuleService.findAllInvoices(filter || 'history');
  }

  @Get('schedule')
  getSchedule() {
    return this.paymentModuleService.getSchedule();
  }

  @Post('schedule')
  setSchedule(@Body('day') day: number, @Body('time') time: string) {
    return this.paymentModuleService.setSchedule(day, time);
  }

  @Post('generate-now')
  manualGenerate() {
      return this.paymentModuleService.manualGenerate();
  }

  @Post()
  create(@Body() createPaymentModuleDto: CreatePaymentModuleDto) {
    return this.paymentModuleService.create(createPaymentModuleDto);
  }

  @Get()
  findAll() {
    return this.paymentModuleService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentModuleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentModuleDto: UpdatePaymentModuleDto) {
    return this.paymentModuleService.update(id, updatePaymentModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentModuleService.remove(id);
  }

  @Public()
  @Post('upload-proof/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './img/invoice/transfer';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${req.params.id}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
       if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
           return cb(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
       }
       cb(null, true);
    }
  }))
  async uploadProof(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
      if (!file) {
          throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }
      const photoUrl = `img/invoice/transfer/${file.filename}`;
      return this.paymentModuleService.uploadProof(id, photoUrl);
  }
}
