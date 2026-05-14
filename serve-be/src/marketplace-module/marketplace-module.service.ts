import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import {
  MarketplacePaymentMethod,
  MarketplacePaymentStatus,
  Order,
  OrderStatus,
} from './entities/order.entity';
import { User, UserRole } from '../auths-module/entities/user.entity';
import { Student } from '../academic-module/entities/student.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class MarketplaceModuleService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private dataSource: DataSource,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const product = this.productsRepository.create({
      ...dto,
      categoryId: dto.categoryId ?? null,
    });
    return this.productsRepository.save(product);
  }

  findAllProducts() {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: { category: true },
    });
  }

  async findProductById(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.findProductById(id);

    this.productsRepository.merge(product, {
      ...dto,
      categoryId:
        dto.categoryId === undefined ? product.categoryId : dto.categoryId,
    });

    return this.productsRepository.save(product);
  }

  async removeProduct(id: string) {
    const product = await this.findProductById(id);
    return this.productsRepository.remove(product);
  }

  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      ...dto,
      description: dto.description ?? null,
    });
    return this.categoriesRepository.save(category);
  }

  findAllCategories() {
    return this.categoriesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findCategoryById(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.findCategoryById(id);
    this.categoriesRepository.merge(category, dto);
    return this.categoriesRepository.save(category);
  }

  async removeCategory(id: string) {
    const category = await this.findCategoryById(id);
    return this.categoriesRepository.remove(category);
  }

  private async generatePickupCode(
    manager: Repository<Order>,
  ): Promise<string> {
    while (true) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await manager.findOne({ where: { pickupCode: code } });
      if (!existing) {
        return code;
      }
    }
  }

  private async resolveLinkedStudent(user: User, linkedStudentId?: string) {
    if (user.role === UserRole.STUDENT) {
      if (!user.studentProfile) {
        throw new BadRequestException('Student profile not found');
      }
      if (linkedStudentId && linkedStudentId !== user.studentProfile.id) {
        throw new ForbiddenException(
          'Student can only order for their own profile',
        );
      }
      return user.studentProfile;
    }

    if (user.role === UserRole.PARENT) {
      if (!linkedStudentId) {
        throw new BadRequestException('Parent must choose a student');
      }
      const student = await this.studentsRepository.findOne({
        where: { id: linkedStudentId },
        relations: { parent: { user: true }, user: true },
      });
      if (!student || !student.parent || student.parent.user.id !== user.id) {
        throw new ForbiddenException(
          'Selected student is not linked to this parent',
        );
      }
      return student;
    }

    if (linkedStudentId) {
      const student = await this.studentsRepository.findOne({
        where: { id: linkedStudentId },
        relations: { user: true },
      });
      if (!student) {
        throw new NotFoundException('Linked student not found');
      }
      return student;
    }

    return null;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        studentProfile: true,
        parentProfile: { students: true },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const linkedStudent = await this.resolveLinkedStudent(
      user,
      dto.linkedStudentId,
    );

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);

      const orderItems: Order['items'] = [];
      let totalAmount = 0;

      for (const item of dto.items) {
        const product = await productRepo.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price),
          productName: product.name,
          imageUrl: product.imageUrl ?? null,
        });

        totalAmount += Number(product.price) * item.quantity;
      }

      const order = orderRepo.create({
        user,
        linkedStudent,
        items: orderItems,
        totalAmount,
        status:
          dto.paymentMethod === MarketplacePaymentMethod.CASH
            ? OrderStatus.PENDING
            : OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        paymentStatus:
          dto.paymentMethod === MarketplacePaymentMethod.CASH
            ? MarketplacePaymentStatus.PENDING
            : MarketplacePaymentStatus.PENDING,
        pickupCode: await this.generatePickupCode(orderRepo),
      });

      const savedOrder = await orderRepo.save(order);

      for (const item of dto.items) {
        await productRepo.decrement(
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }

      return orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: {
          user: true,
          linkedStudent: { user: true },
          verifiedBy: true,
        },
      });
    });
  }

  findAllOrders() {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
        linkedStudent: { user: true },
        verifiedBy: true,
      },
    });
  }

  async findOrderById(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        linkedStudent: { user: true },
        verifiedBy: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: {
        linkedStudent: { user: true },
        verifiedBy: true,
      },
    });
  }

  async findMyOrderById(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: {
        user: true,
        linkedStudent: { user: true },
        verifiedBy: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async submitPaymentProof(
    userId: string,
    orderId: string,
    paymentProofUrl: string,
  ) {
    const order = await this.findMyOrderById(userId, orderId);
    if (order.paymentMethod !== MarketplacePaymentMethod.TRANSFER) {
      throw new BadRequestException(
        'Payment proof is only allowed for transfer orders',
      );
    }

    order.paymentProofUrl = paymentProofUrl;
    order.paymentSubmittedAt = new Date();
    order.paymentStatus = MarketplacePaymentStatus.WAITING_CONFIRMATION;
    order.adminNotes = null;
    return this.ordersRepository.save(order);
  }

  async confirmOrderPayment(
    adminUserId: string,
    orderId: string,
    adminNotes?: string,
  ) {
    const [order, adminUser] = await Promise.all([
      this.findOrderById(orderId),
      this.usersRepository.findOne({ where: { id: adminUserId } }),
    ]);

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    order.paymentStatus = MarketplacePaymentStatus.CONFIRMED;
    order.status = OrderStatus.PAID;
    order.verifiedBy = adminUser;
    order.verifiedAt = new Date();
    order.adminNotes = adminNotes ?? null;
    return this.ordersRepository.save(order);
  }

  async rejectOrderPayment(
    adminUserId: string,
    orderId: string,
    adminNotes?: string,
  ) {
    const [order, adminUser] = await Promise.all([
      this.findOrderById(orderId),
      this.usersRepository.findOne({ where: { id: adminUserId } }),
    ]);

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    order.paymentStatus = MarketplacePaymentStatus.REJECTED;
    order.verifiedBy = adminUser;
    order.verifiedAt = new Date();
    order.adminNotes = adminNotes ?? null;
    return this.ordersRepository.save(order);
  }

  async deleteOrder(orderId: string) {
    const order = await this.findOrderById(orderId);
    await this.ordersRepository.remove(order);
    return { message: 'Order deleted successfully' };
  }
}
