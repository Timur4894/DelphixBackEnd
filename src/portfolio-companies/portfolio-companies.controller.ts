import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortfolioCompaniesService } from './portfolio-companies.service';
import { CreatePortfolioCompanyDto } from './dto/create-portfolio-company.dto';
import { UpdatePortfolioCompanyDto } from './dto/update-portfolio-company.dto';

@Controller('portfolio-companies')
export class PortfolioCompaniesController {
  constructor(private readonly portfolioCompaniesService: PortfolioCompaniesService) {}

  @Post()
  create(@Body() createPortfolioCompanyDto: CreatePortfolioCompanyDto) {
    return this.portfolioCompaniesService.create(createPortfolioCompanyDto);
  }

  @Get()
  findAll() {
    return this.portfolioCompaniesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioCompaniesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioCompanyDto: UpdatePortfolioCompanyDto) {
    return this.portfolioCompaniesService.update(+id, updatePortfolioCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioCompaniesService.remove(+id);
  }
}
