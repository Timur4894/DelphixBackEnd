import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForecastsService } from './forecasts.service';
import { CreateForecastDto } from './dto/create-forecast.dto';

@Controller('forecasts')
export class ForecastsController {
  constructor(private readonly forecastsService: ForecastsService) {}



  @Get()
  findAll() {
    return this.forecastsService.findAll();
  }

}
