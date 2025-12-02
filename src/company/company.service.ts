import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { SearchCompanyDto } from './dto/search-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(searchDto?: SearchCompanyDto) {
    const { search, page = 1, limit = 10 } = searchDto || {};
    
    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    if (search) {
      queryBuilder.where(
        '(company.name ILIKE :search OR company.ticker ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    queryBuilder.orderBy('company.name', 'ASC');

    const [companies, total] = await queryBuilder.getManyAndCount();

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    return company;
  }
}
