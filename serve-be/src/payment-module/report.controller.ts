import { Controller, Get, UseGuards } from '@nestjs/common';
import { PaymentModuleService } from './payment-module.service';
// import { JwtAuthGuard } from '../auths-module/guards/jwt-auth.guard'; // Assume global or import if needed

@Controller('reports')
export class ReportController {
  constructor(private readonly paymentService: PaymentModuleService) {}

  @Get('cash-flow')
  getCashFlow() {
    // Mock data for now as per "fundamental" requirement
    return [
      { month: 'Mei', income: 45000000, expense: 32000000 },
      { month: 'Jun', income: 48000000, expense: 35000000 },
      { month: 'Jul', income: 52000000, expense: 38000000 },
      { month: 'Ags', income: 49000000, expense: 42000000 },
      { month: 'Sep', income: 58000000, expense: 40000000 },
      { month: 'Okt', income: 62500000, expense: 38000000 },
    ];
  }

  @Get('aging-ar')
  getAgingAR() {
    // Mock data
    return {
      totalOutstanding: 3750000,
      overdue30Days: 1500000,
      studentCount: 15
    };
  }
}
