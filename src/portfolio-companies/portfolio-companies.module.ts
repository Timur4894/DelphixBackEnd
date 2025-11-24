import { Module } from '@nestjs/common';
import { PortfolioCompaniesService } from './portfolio-companies.service';
import { PortfolioCompaniesController } from './portfolio-companies.controller';

@Module({
  controllers: [PortfolioCompaniesController],
  providers: [PortfolioCompaniesService],
})
export class PortfolioCompaniesModule {}
