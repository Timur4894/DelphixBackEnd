import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioCompaniesController } from './portfolio-companies.controller';
import { PortfolioCompaniesService } from './portfolio-companies.service';

describe('PortfolioCompaniesController', () => {
  let controller: PortfolioCompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioCompaniesController],
      providers: [PortfolioCompaniesService],
    }).compile();

    controller = module.get<PortfolioCompaniesController>(PortfolioCompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
