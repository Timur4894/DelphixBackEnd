import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioCompaniesService } from './portfolio-companies.service';

describe('PortfolioCompaniesService', () => {
  let service: PortfolioCompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioCompaniesService],
    }).compile();

    service = module.get<PortfolioCompaniesService>(PortfolioCompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
