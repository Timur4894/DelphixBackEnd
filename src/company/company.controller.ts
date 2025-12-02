import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, NotFoundException, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly transactionsService: TransactionsService,
  ) {}
  
  @Get()
  findAll(@Query() searchDto: SearchCompanyDto) {
    return this.companyService.findAll(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Post(':id/transaction')
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const company = await this.companyService.findOne(+id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    
    return this.transactionsService.create(
      req.user.id,
      company.ticker,
      createTransactionDto,
    );
  }
}
