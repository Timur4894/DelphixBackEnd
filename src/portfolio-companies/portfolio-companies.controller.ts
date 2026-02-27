import { Controller, Get, Param, Req, UseGuards, Delete } from '@nestjs/common';
import { PortfolioCompaniesService } from './portfolio-companies.service';
import { TransactionsService } from '../transactions/transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portfolio-companies')
@UseGuards(JwtAuthGuard)
export class PortfolioCompaniesController {
  constructor(
    private readonly portfolioCompaniesService: PortfolioCompaniesService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    return this.portfolioCompaniesService.findAll(req.user.id);
  }

  @Get('ticker/:ticker/transactions')
  async getCompanyTransactions(@Req() req: any, @Param('ticker') ticker: string) {
    // Получаем portfolio company для проверки что она существует
    const portfolioCompany = await this.portfolioCompaniesService.findByTicker(req.user.id, ticker);
    if (!portfolioCompany) {
      return { transactions: [], message: 'Company not found in portfolio' };
    }

    // Получаем все транзакции по этому тикеру
    const transactions = await this.transactionsService.getCompanyTransactions(req.user.id, ticker);
    
    return {
      portfolio_company: portfolioCompany,
      transactions,
    };
  }

  @Get('ticker/:ticker')
  findByTicker(@Req() req: any, @Param('ticker') ticker: string) {
    return this.portfolioCompaniesService.findByTicker(req.user.id, ticker);
  }

  @Delete('ticker/:ticker')
  removeByTicker(@Req() req: any, @Param('ticker') ticker: string) {
    return this.portfolioCompaniesService.removeByTicker(req.user.id, ticker);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.portfolioCompaniesService.findOne(req.user.id, +id);
  }
}
