import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioCompany } from '../portfolio-companies/entities/portfolio-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioCompany])],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
