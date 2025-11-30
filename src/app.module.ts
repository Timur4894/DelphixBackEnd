import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PortfolioCompaniesModule } from './portfolio-companies/portfolio-companies.module';
import { NewsModule } from './news/news.module';
import { ForecastsModule } from './forecasts/forecasts.module';
import { CompanyModule } from './company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Forecast } from './forecasts/entities/forecast.entity';
import { NewsItem } from './news/entities/news.entity';
import { PortfolioCompany } from './portfolio-companies/entities/portfolio-company.entity';
import { Company } from './company/entities/company.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    url: process.env.SUPABASE_DB_URL,
    entities: [User, PortfolioCompany, NewsItem, Forecast, Company, Transaction],
    synchronize: true, 
    ssl: {
      rejectUnauthorized: false,
    },
  }),
    UserModule, PortfolioCompaniesModule, NewsModule, ForecastsModule, CompanyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
