import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('company/:ticker')
  async create(
    @Req() req: any,
    @Param('ticker') ticker: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.id, ticker, createTransactionDto);
  }

  @Get()
  async getUserTransactions(@Req() req: any) {
    return this.transactionsService.getUserTransactions(req.user.id);
  }

  @Get('company/:ticker')
  async getCompanyTransactions(@Req() req: any, @Param('ticker') ticker: string) {
    return this.transactionsService.getCompanyTransactions(req.user.id, ticker);
  }
}

