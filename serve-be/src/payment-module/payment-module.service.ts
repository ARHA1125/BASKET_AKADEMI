import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

      const activeStudents = parent.students.filter(
        student => student.user?.status === 'Active'
      );

      if (activeStudents.length === 0) continue;

      const invoice = new Invoice();
      invoice.parent = parent;
      invoice.dueDate = new Date(new Date().setDate(new Date().getDate() + 7));
      invoice.status = InvoiceStatus.UNPAID;
      invoice.month = monthStr;
      invoice.deliveryStatus = 'BELUM_TERKIRIM';
      invoice.items = [];
      let totalAmount = 0;

      for (const student of activeStudents) {
        const item = new InvoiceItem();
        item.description = `SPP Bulanan - ${student.user?.fullName || 'Student'} - ${new Date().toLocaleString('default', { month: 'long' })}`;
        item.amount = 100000;
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
    // Sanitize the ID to fix links containing trailing punctuation (e.g. `; or backticks)
    const cleanId = id.replace(/[^a-fA-F0-9-]/g, '');
    
    // Validate UUID format before querying to prevent Postgres QueryFailedError
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
      return null;
    }

    const invoice = await this.invoiceRepository.findOne({
      where: { id: cleanId },
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

  async getReminderSchedule() {
    const daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_DAY' },
    });
    const timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_TIME' },
    });

    return {
      day: daySetting ? parseInt(daySetting.value) : 1, // Default to 1st of month maybe, or empty?
      time: timeSetting ? timeSetting.value : '09:00', // Default morning
    };
  }

  async setReminderSchedule(day: number, time: string) {
    let daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_DAY' },
    });
    if (!daySetting) {
      daySetting = this.systemSettingRepository.create({
        key: 'REMINDER_GENERATION_DAY',
      });
    }
    daySetting.value = day.toString();
    await this.systemSettingRepository.save(daySetting);

    let timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_TIME' },
    });
    if (!timeSetting) {
      timeSetting = this.systemSettingRepository.create({
        key: 'REMINDER_GENERATION_TIME',
      });
    }
    timeSetting.value = time;
    return this.systemSettingRepository.save(timeSetting);
  }

  async manualGenerate() {
    return this.generateMonthlyInvoices();
  }

  async findAllInvoices(filter: 'current' | 'history', month?: number, year?: number) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .orderBy('invoice.createdAt', 'DESC');

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.where('invoice.createdAt >= :start AND invoice.createdAt <= :end', { start: startOfMonth, end: endOfMonth });
      
      if (filter === 'current') {
          // If they are on "Aktif" tab but select a month, maybe keep only unpaid ones
          query.andWhere('invoice.status = :status', { status: InvoiceStatus.UNPAID });
      }
    } else if (filter === 'current') {
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
        category: 'SPP Bulanan',
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

  async deleteAllInvoices(filter: 'current' | 'history') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (filter === 'current') {
      query.where('invoice.createdAt >= :start', { start: startOfMonth });
    } else {
      query.where('invoice.createdAt < :start', { start: startOfMonth });
    }

    const invoicesToDelete = await query.getMany();
    
    if (invoicesToDelete.length === 0) {
      return { deleted: false, count: 0, message: 'No invoices found to delete.' };
    }

    await this.invoiceRepository.remove(invoicesToDelete);

    return { deleted: true, count: invoicesToDelete.length };
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

  async getOverviewData() {
    // 1. Total Revenue & Target (Current Month)
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const endOfCurrentMonth = new Date();
    endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1);
    endOfCurrentMonth.setDate(0); 
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    const currentMonthInvoices = await this.invoiceRepository.find({
        where: {
            createdAt: Between(startOfCurrentMonth, endOfCurrentMonth)
        }
    });

    const totalRevenue = currentMonthInvoices
        .filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + Number(inv.uniqueAmount || inv.amount || 0), 0);
        
    const targetRevenue = currentMonthInvoices
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 70000000;

    // Revenue Growth
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0); 
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastMonthInvoices = await this.invoiceRepository.find({
        where: {
            createdAt: Between(lastMonthStart, lastMonthEnd),
            status: InvoiceStatus.PAID
        }
    });

    const lastMonthRevenue = lastMonthInvoices
        .reduce((sum, inv) => sum + Number(inv.uniqueAmount || inv.amount || 0), 0);

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
        revenueGrowth = Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
    } else if (totalRevenue > 0) {
        revenueGrowth = 100;
    }

    // 2. Aging AR (Outstanding)
    const unpaidInvoices = await this.invoiceRepository.find({
        where: {
             status: InvoiceStatus.UNPAID
        }
    });
    
    const agingAR = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const agingStudents = unpaidInvoices.length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const overdueInvoices = unpaidInvoices.filter(inv => inv.dueDate && new Date(inv.dueDate) < thirtyDaysAgo);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

    // 3. Net Profit Estimate & Expenses
    const payrolls = await this.calculatePayroll('current');
    const estimatedExpenses = payrolls.reduce((sum, p) => sum + Number(p.total || 0), 0); 

    const netProfit = totalRevenue - estimatedExpenses;
    let grossMargin = 0;
    if (totalRevenue > 0) {
        grossMargin = Math.round((netProfit / totalRevenue) * 100);
    } else if (netProfit < 0) {
        grossMargin = -100;
    }

    // 4. Cash Flow Trends (Last 6 Months)
    const cashFlow: any[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        
        const monthInvoices = await this.invoiceRepository.find({
            where: {
                createdAt: Between(monthStart, monthEnd)
            }
        });
        
        const income = monthInvoices
            .filter(inv => inv.status === InvoiceStatus.PAID)
            .reduce((sum, inv) => sum + Number(inv.uniqueAmount || inv.amount || 0), 0);
            
        const expense = monthInvoices
            .filter(inv => inv.status === InvoiceStatus.UNPAID)
            .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        
        cashFlow.push({
            month: d.toLocaleString('id-ID', { month: 'short' }),
            income: income,
            expense: expense
        });
    }

    // 5. Recent Transactions
    const recentDbInvoices = await this.invoiceRepository.find({
        where: { status: InvoiceStatus.PAID },
        order: {
            verifiedAt: 'DESC'
        },
        take: 5
    });
    
    const recentTransactions = recentDbInvoices.map((inv, idx) => ({
        id: inv.id,
        title: 'Pembayaran SPP',
        date: inv.verifiedAt ? new Date(inv.verifiedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-',
        amount: Number(inv.uniqueAmount || inv.amount || 0),
        type: 'income'
    }));

    return {
        totalRevenue,
        targetRevenue,
        revenueGrowth,
        agingAR,
        agingStudents,
        overdueAmount,
        netProfit,
        grossMargin,
        cashFlow,
        recentTransactions
    };
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
