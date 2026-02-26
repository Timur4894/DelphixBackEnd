import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async searchCompaniesFromFinnhub(
    query: string,
    page = 1,
    limit = 10,
  ) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }
  
    if (!query) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`,
      );
  
      if (!res.ok) {
        throw new Error(`Finnhub error: ${res.status}`);
      }
      
      const data = await res.json();
  
      // Finnhub возвращает { count, result: [] }
      let results = data.result ?? [];
  
      // 🔹 Можно отфильтровать только акции
      results = results.filter(
        (item) => item.type === 'Common Stock',
      );
  
      const total = results.length;
  
      // 🔹 Реализуем offset вручную
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = results.slice(start, end);
  
      return {
        data: paginated.map((item) => ({
          ticker: item.symbol,
          displaySymbol: item.displaySymbol,
          name: item.description,
          type: item.type,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to search companies from Finnhub',
      );
    }
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    return company;
  }

  async findOneByTicker(ticker: string) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }
  
    if (!ticker?.trim()) {
      throw new InternalServerErrorException('Ticker is required');
    }
  
    try {
     
      const searchRes = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(ticker)}&token=${apiKey}`,
      );
  
      if (!searchRes.ok) {
        throw new Error(`Finnhub search error: ${searchRes.status}`);
      }
  
      const searchData = await searchRes.json();
      const results = searchData.result ?? [];
  
      // 🔹 Отбираем только Common Stock
      const company = results.find((item) => item.type === 'Common Stock');
  
      if (!company) {
        return null; // Или кинуть NotFoundException
      }
  
      // 2️⃣ Подтягиваем котировку
      const quoteRes = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${company.symbol}&token=${apiKey}`,
      );
  
      if (!quoteRes.ok) {
        throw new Error(`Finnhub quote error: ${quoteRes.status}`);
      }
  
      const quote = await quoteRes.json();
  
      return {
        ticker: company.symbol,
        displaySymbol: company.displaySymbol,
        name: company.description,
        type: company.type,
        price: quote.c ?? null,
        change: quote.d ?? null,
        changePercent: quote.dp ?? null,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch company data from Finnhub',
      );
    }
  }

  async getTopCompaniesWithQuotes(limit = 10) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }

    // Берём первые N компаний (например, отсортированные по id)
    const companies = await this.companyRepository.find({
      order: { id: 'ASC' },
      take: limit,
    });

    const enriched = await Promise.all(
      companies.map(async (company) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${company.ticker}&token=${apiKey}`,
          );

          if (!res.ok) {
            throw new Error(`Finnhub error: ${res.status}`);
          }

          const quote = await res.json();

          return {
            id: company.id,
            ticker: company.ticker,
            name: company.name,
            description: company.description,
            logo_url: company.logo_url,
            price: quote.c ?? null,          // current price
            change: quote.d ?? null,         // abs change
            changePercent: quote.dp ?? null, // % change
          };
        } catch {
          // Если Finnhub упал — отдаем компанию без цены
          return {
            id: company.id,
            ticker: company.ticker,
            name: company.name,
            description: company.description,
            logo_url: company.logo_url,
            price: null,
            change: null,
            changePercent: null,
          };
        }
      }),
    );

    return enriched;
  }
}