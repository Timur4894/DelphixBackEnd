import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForecastsService } from './forecasts.service';
import { CreateForecastDto } from './dto/create-forecast.dto';
import { UpdateForecastDto } from './dto/update-forecast.dto';

@Controller('forecasts')
export class ForecastsController {
  constructor(private readonly forecastsService: ForecastsService) {}

  @Post()
  create(@Body() createForecastDto: CreateForecastDto) {
    return this.forecastsService.create(createForecastDto);
  }

  @Get()
  findAll() {
    return this.forecastsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forecastsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateForecastDto: UpdateForecastDto) {
    return this.forecastsService.update(+id, updateForecastDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forecastsService.remove(+id);
  }
}
