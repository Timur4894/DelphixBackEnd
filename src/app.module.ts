import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PortfolioCompaniesModule } from './portfolio-companies/portfolio-companies.module';
import { NewsModule } from './news/news.module';
import { ForecastsModule } from './forecasts/forecasts.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [UserModule, PortfolioCompaniesModule, NewsModule, ForecastsModule, CompanyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
