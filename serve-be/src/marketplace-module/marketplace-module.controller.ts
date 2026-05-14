import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MarketplaceModuleService } from './marketplace-module.service';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyOrderPaymentDto } from './dto/verify-order-payment.dto';
import { RejectOrderPaymentDto } from './dto/reject-order-payment.dto';

@Controller('marketplace')
export class MarketplaceModuleController {
  constructor(
    private readonly marketplaceModuleService: MarketplaceModuleService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post('products/upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadRoot =
            process.env.UPLOAD_DIR || join(process.cwd(), 'img');
          const dest = join(uploadRoot, 'produk');
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const safeExt = extname(file.originalname || '').toLowerCase();
          const ext = safeExt && safeExt.length <= 10 ? safeExt : '';
          const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/img/produk/${file.filename}` };
  }

  @Roles(UserRole.ADMIN)
  @Post('orders/:id/upload-proof')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadRoot =
            process.env.UPLOAD_DIR || join(process.cwd(), 'img');
          const dest = join(uploadRoot, 'marketplace-payments');
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const safeExt = extname(file.originalname || '').toLowerCase();
          const ext = safeExt && safeExt.length <= 10 ? safeExt : '';
          const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  uploadAdminOrderProof(@UploadedFile() file: Express.Multer.File) {
    return { url: `/img/marketplace-payments/${file.filename}` };
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Post('my-orders/:id/upload-proof')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadRoot =
            process.env.UPLOAD_DIR || join(process.cwd(), 'img');
          const dest = join(uploadRoot, 'marketplace-payments');
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const safeExt = extname(file.originalname || '').toLowerCase();
          const ext = safeExt && safeExt.length <= 10 ? safeExt : '';
          const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  submitPaymentProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.marketplaceModuleService.submitPaymentProof(
      req.user.id,
      id,
      `/img/marketplace-payments/${file.filename}`,
    );
  }

  @Roles(UserRole.ADMIN)
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.marketplaceModuleService.createProduct(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('products')
  findAllProducts() {
    return this.marketplaceModuleService.findAllProducts();
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('products/:id')
  findProductById(@Param('id') id: string) {
    return this.marketplaceModuleService.findProductById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.marketplaceModuleService.updateProduct(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete('products/:id')
  removeProduct(@Param('id') id: string) {
    return this.marketplaceModuleService.removeProduct(id);
  }

  @Roles(UserRole.ADMIN)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.marketplaceModuleService.createCategory(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('categories')
  findAllCategories() {
    return this.marketplaceModuleService.findAllCategories();
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    return this.marketplaceModuleService.findCategoryById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.marketplaceModuleService.updateCategory(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.marketplaceModuleService.removeCategory(id);
  }

  @Roles(UserRole.ADMIN)
  @Get('orders')
  findAllOrders() {
    return this.marketplaceModuleService.findAllOrders();
  }

  @Roles(UserRole.ADMIN)
  @Get('orders/:id')
  findOrderById(@Param('id') id: string) {
    return this.marketplaceModuleService.findOrderById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch('orders/:id/confirm-payment')
  confirmOrderPayment(
    @Param('id') id: string,
    @Body() dto: VerifyOrderPaymentDto,
    @Request() req,
  ) {
    return this.marketplaceModuleService.confirmOrderPayment(
      req.user.id,
      id,
      dto.adminNotes,
    );
  }

  @Roles(UserRole.ADMIN)
  @Patch('orders/:id/reject-payment')
  rejectOrderPayment(
    @Param('id') id: string,
    @Body() dto: RejectOrderPaymentDto,
    @Request() req,
  ) {
    return this.marketplaceModuleService.rejectOrderPayment(
      req.user.id,
      id,
      dto.adminNotes,
    );
  }

  @Roles(UserRole.ADMIN)
  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.marketplaceModuleService.deleteOrder(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('my-orders')
  findMyOrders(@Request() req) {
    return this.marketplaceModuleService.findMyOrders(req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Get('my-orders/:id')
  findMyOrderById(@Param('id') id: string, @Request() req) {
    return this.marketplaceModuleService.findMyOrderById(req.user.id, id);
  }

  @Roles(UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.COACH)
  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto, @Request() req) {
    return this.marketplaceModuleService.createOrder(req.user.id, dto);
  }
}
