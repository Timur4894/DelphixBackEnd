import { Module } from '@nestjs/common';
import { ForecastsService } from './forecasts.service';
import { ForecastsController } from './forecasts.controller';

@Module({
  controllers: [ForecastsController],
  providers: [ForecastsService],
})
export class ForecastsModule {}
