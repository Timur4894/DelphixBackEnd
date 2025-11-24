import { Test, TestingModule } from '@nestjs/testing';
import { ForecastsController } from './forecasts.controller';
import { ForecastsService } from './forecasts.service';

describe('ForecastsController', () => {
  let controller: ForecastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForecastsController],
      providers: [ForecastsService],
    }).compile();

    controller = module.get<ForecastsController>(ForecastsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
