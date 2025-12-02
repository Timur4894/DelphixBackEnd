import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioCompaniesService } from './portfolio-companies.service';
import { PortfolioCompaniesController } from './portfolio-companies.controller';
import { PortfolioCompany } from './entities/portfolio-company.entity';
import { Company } from '../company/entities/company.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioCompany, Company]),
    TransactionsModule,
  ],
  controllers: [PortfolioCompaniesController],
  providers: [PortfolioCompaniesService],
  exports: [PortfolioCompaniesService],
})
export class PortfolioCompaniesModule {}
