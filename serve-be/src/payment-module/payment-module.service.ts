import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentModuleDto } from './dto/create-payment-module.dto';
import { UpdatePaymentModuleDto } from './dto/update-payment-module.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class PaymentModuleService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
  ) {}

  create(createPaymentModuleDto: CreatePaymentModuleDto) {
    return 'This action adds a new paymentModule';
  }

  async generateMonthlyInvoices() {
    const parents = await this.parentRepository.find({
      relations: ['students', 'students.user', 'students.trainingClass', 'user'],
    });
    const invoices: Invoice[] = [];

    for (const parent of parents) {
      if (!parent.students || parent.students.length === 0) continue;

      const now = new Date();
      const monthStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

      const existingInvoice = await this.invoiceRepository.findOne({
        where: {
          parent: { id: parent.id },
          month: monthStr,
        },
      });

      if (existingInvoice) {
        continue;
      }

      const invoice = new Invoice();
      invoice.parent = parent;
      invoice.dueDate = new Date(new Date().setDate(new Date().getDate() + 7));
      invoice.status = InvoiceStatus.UNPAID;
      invoice.month = monthStr;
      invoice.deliveryStatus = 'BELUM_TERKIRIM';
      invoice.items = [];
      let totalAmount = 0;

      for (const student of parent.students) {
        const item = new InvoiceItem();
        item.description = `SPP Monthly - ${student.user?.fullName || 'Student'} - ${new Date().toLocaleString('default', { month: 'long' })}`;
        item.amount = 200000;
        item.student = student;

        invoice.items.push(item);
        totalAmount += item.amount;
      }

      invoice.amount = totalAmount;
      
      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      invoice.uniqueCode = uniqueCode;
      invoice.uniqueAmount = totalAmount + uniqueCode;
      
      const savedInvoice = await this.invoiceRepository.save(invoice);
      invoices.push(savedInvoice);
    }

    return invoices;
  }

  async calculatePayroll(period: string) {
    return [
      { coach: 'Coach Shin', sessions: 24, total: 4100000, status: 'PAID' },
      { coach: 'Coach Indra', sessions: 18, total: 2160000, status: 'PROCESSING' },
    ];
  }

  async createPaymentLink(invoiceId: string) {
    return `https://checkout.midtrans.com/${invoiceId}`;
  }

  async handlePaymentCallback(payload: any) {
    console.log('Payment Callback:', payload);
    return { status: 'ok' };
  }

  findAll() {
    return `This action returns all paymentModule`;
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.student',
        'items.student.user',
        'items.student.trainingClass',
        'parent',
        'parent.user',
      ],
    });
    return invoice;
  }

  update(id: string, updatePaymentModuleDto: UpdatePaymentModuleDto) {
    return `This action updates a #${id} paymentModule`;
  }

  async getSchedule() {
    const daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_DAY' },
    });
    const timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_TIME' },
    });

    return {
      day: daySetting ? parseInt(daySetting.value) : 1,
      time: timeSetting ? timeSetting.value : '00:00',
    };
  }

  async setSchedule(day: number, time: string) {
    let daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_DAY' },
    });
    if (!daySetting) {
      daySetting = this.systemSettingRepository.create({
        key: 'INVOICE_GENERATION_DAY',
      });
    }
    daySetting.value = day.toString();
    await this.systemSettingRepository.save(daySetting);

    let timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_TIME' },
    });
    if (!timeSetting) {
      timeSetting = this.systemSettingRepository.create({
        key: 'INVOICE_GENERATION_TIME',
      });
    }
    timeSetting.value = time;
    return this.systemSettingRepository.save(timeSetting);
  }

  async manualGenerate() {
    return this.generateMonthlyInvoices();
  }

  async findAllInvoices(filter: 'current' | 'history') {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .orderBy('invoice.createdAt', 'DESC');

    if (filter === 'current') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query.where('invoice.createdAt >= :start', { start: startOfMonth });
    }

    const invoices = await query.getMany();

    return invoices.map(inv => {
      const uniqueStudents = [
        ...new Set(inv.items.map(i => i.student?.user?.fullName || 'Unknown')),
      ];
      const studentName =
        uniqueStudents.length > 1
          ? `${uniqueStudents[0]} (+${uniqueStudents.length - 1})`
          : uniqueStudents[0];

      return {
        id: inv.id,
        student: studentName || 'Unknown',
        category: 'SPP Monthly',
        date: inv.createdAt.toISOString().split('T')[0],
        amount: inv.amount,
        uniqueCode: inv.uniqueCode,
        uniqueAmount: inv.uniqueAmount,
        paymentMethod: inv.paymentMethod,
        status: inv.status.toLowerCase(),
        method: '-',
        photoUrl: inv.photo_url,
        isVerified: inv.isVerified || false,
        verifiedAt: inv.verifiedAt,
        verifiedBy: inv.verifiedBy
      };
    });
  }

  async remove(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) return { deleted: false, message: 'Invoice not found' };

    await this.invoiceRepository.remove(invoice);
    return { deleted: true, id };
  }

  async findCurrentMonthInvoicesEntities() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('invoice.createdAt >= :start', { start: startOfMonth })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async findUnsentInvoicesForCurrentMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('invoice.createdAt >= :start', { start: startOfMonth })
      .andWhere('invoice.deliveryStatus = :status', { status: 'BELUM_TERKIRIM' })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async uploadProof(id: string, photoUrl: string) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
        throw new Error('Invoice not found');
    }
    invoice.photo_url = photoUrl;
    return this.invoiceRepository.save(invoice);
  }

  async verifyInvoice(
    id: string, 
    adminId: string, 
    paymentMethod: 'TRANSFER' | 'CASH',
    paidAmount?: number
  ) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    if (paymentMethod === 'TRANSFER') {
      if (!invoice.photo_url) {
        throw new Error('No payment proof uploaded for transfer');
      }
      if (paidAmount && invoice.uniqueAmount && paidAmount !== invoice.uniqueAmount) {
        throw new Error(`Amount mismatch. Expected: ${invoice.uniqueAmount}, Received: ${paidAmount}`);
      }
    } else if (paymentMethod === 'CASH') {
      if (paidAmount && paidAmount < invoice.amount) {
        throw new Error(`Insufficient amount. Expected at least: ${invoice.amount}, Received: ${paidAmount}`);
      }
    }
    
    invoice.isVerified = true;
    invoice.verifiedAt = new Date();
    invoice.verifiedBy = adminId;
    invoice.status = InvoiceStatus.PAID;
    invoice.paymentMethod = paymentMethod;
    
    return this.invoiceRepository.save(invoice);
  }
}
