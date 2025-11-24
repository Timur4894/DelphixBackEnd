import { Injectable } from '@nestjs/common';
import { CreatePortfolioCompanyDto } from './dto/create-portfolio-company.dto';
import { UpdatePortfolioCompanyDto } from './dto/update-portfolio-company.dto';

@Injectable()
export class PortfolioCompaniesService {
  create(createPortfolioCompanyDto: CreatePortfolioCompanyDto) {
    return 'This action adds a new portfolioCompany';
  }

  findAll() {
    return `This action returns all portfolioCompanies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolioCompany`;
  }

  update(id: number, updatePortfolioCompanyDto: UpdatePortfolioCompanyDto) {
    return `This action updates a #${id} portfolioCompany`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolioCompany`;
  }
}
