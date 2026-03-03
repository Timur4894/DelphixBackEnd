import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForecastsService } from './forecasts.service';
import { ForecastsController } from './forecasts.controller';
import { NewsModule } from '../news/news.module';
import { Forecast } from './entities/forecast.entity';

@Module({
  imports: [NewsModule, TypeOrmModule.forFeature([Forecast])],
  controllers: [ForecastsController],
  providers: [ForecastsService],
})
export class ForecastsModule {}
