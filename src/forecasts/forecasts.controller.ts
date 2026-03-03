import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ForecastsService } from './forecasts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forecasts')
@UseGuards(JwtAuthGuard)
export class ForecastsController {
  constructor(private readonly forecastsService: ForecastsService) {}


  @Get()
  findAll(@Req() req: any) {
    return this.forecastsService.getPersonalForecasts(req.user.id);
  }

}
