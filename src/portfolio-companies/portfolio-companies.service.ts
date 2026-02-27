import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioCompany } from './entities/portfolio-company.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class PortfolioCompaniesService {
  constructor(
    @InjectRepository(PortfolioCompany)
    private readonly portfolioCompanyRepository: Repository<PortfolioCompany>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  private async getCurrentPriceForTicker(ticker: string): Promise<number | null> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }

    if (!ticker?.trim()) {
      return null;
    }

    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
          ticker,
        )}&token=${apiKey}`,
      );

      if (!res.ok) {
        throw new Error(`Finnhub quote error: ${res.status}`);
      }

      const quote = await res.json();
      const price = typeof quote?.c === 'number' ? quote.c : null;
      return price;
    } catch {
      // Если котировку получить не удалось — вернем null, дальше используем avg_price
      return null;
    }
  }

  private async buildPortfolioView(pc: PortfolioCompany) {
    const livePrice = await this.getCurrentPriceForTicker(pc.ticker);
    const currentPrice = livePrice ?? pc.avg_price;

    const totalInvested = pc.shares * pc.avg_price;
    const currentValue = pc.shares * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent =
      totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      id: pc.id,
      ticker: pc.ticker,
      company: pc.company,
      shares: pc.shares,
      avg_price: pc.avg_price,
      current_price: currentPrice,
      total_invested: totalInvested,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      created_at: pc.created_at,
    };
  }

  async findAll(userId: number) {
    const portfolioCompanies = await this.portfolioCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'],
      order: { created_at: 'DESC' },
    });

    // Для каждой позиции считаем прибыль/убыток исходя из ТЕКУЩЕЙ цены с Finnhub
    return Promise.all(portfolioCompanies.map((pc) => this.buildPortfolioView(pc)));
  }

  async findOne(userId: number, id: number) {
    const portfolioCompany = await this.portfolioCompanyRepository.findOne({
      where: { id, user_id: userId },
      relations: ['company'],
    });

    if (!portfolioCompany) {
      return null;
    }
    return this.buildPortfolioView(portfolioCompany);
  }

  async findByTicker(userId: number, ticker: string) {
    const portfolioCompany = await this.portfolioCompanyRepository.findOne({
      where: { user_id: userId, ticker },
      relations: ['company'],
    });

    if (!portfolioCompany) {
      return null;
    }
    return this.buildPortfolioView(portfolioCompany);
  }

  async removeByTicker(userId: number, ticker: string) {
    const existing = await this.portfolioCompanyRepository.findOne({
      where: { user_id: userId, ticker },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio holding not found');
    }

    await this.portfolioCompanyRepository.remove(existing);

    return {
      message: 'Holding removed from portfolio',
      ticker,
    };
  }
}
