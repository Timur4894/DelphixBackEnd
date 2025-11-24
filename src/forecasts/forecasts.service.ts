import { Injectable } from '@nestjs/common';
import { CreateForecastDto } from './dto/create-forecast.dto';
import { UpdateForecastDto } from './dto/update-forecast.dto';

@Injectable()
export class ForecastsService {
  create(createForecastDto: CreateForecastDto) {
    return 'This action adds a new forecast';
  }

  findAll() {
    return `This action returns all forecasts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} forecast`;
  }

  update(id: number, updateForecastDto: UpdateForecastDto) {
    return `This action updates a #${id} forecast`;
  }

  remove(id: number) {
    return `This action removes a #${id} forecast`;
  }
}
