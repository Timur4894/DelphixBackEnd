import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { PortfolioCompany } from '../portfolio-companies/entities/portfolio-company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PortfolioCompany]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}




