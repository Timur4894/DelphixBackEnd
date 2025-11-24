import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioCompanyDto } from './create-portfolio-company.dto';

export class UpdatePortfolioCompanyDto extends PartialType(CreatePortfolioCompanyDto) {}
