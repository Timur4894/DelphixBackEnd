import { Injectable } from '@nestjs/common';
import { CreateForecastDto } from './dto/create-forecast.dto';


@Injectable()
export class ForecastsService {

  findAll() {
    return `This action returns all forecasts`;
  }

}
