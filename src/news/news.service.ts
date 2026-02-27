import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioCompany } from '../portfolio-companies/entities/portfolio-company.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(PortfolioCompany)
    private readonly portfolioCompanyRepository: Repository<PortfolioCompany>,
  ) {}

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  private async getNewsForTicker(
    ticker: string,
    from: string,
    to: string,
  ): Promise<any[]> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }

    if (!ticker?.trim()) {
      throw new BadRequestException('Ticker is required');
    }

    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(
          ticker,
        )}&from=${from}&to=${to}&token=${apiKey}`,
      );

      if (!res.ok) {
        throw new Error(`Finnhub quote error: ${res.status}`);
      }

      const news = await res.json();
      return Array.isArray(news) ? news : [];
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch current news from Finnhub',
      );
    }
  }
  
  async getNewsForUserPortfolioLast3Days(userId: number) {
    const holdings = await this.portfolioCompanyRepository.find({
      where: { user_id: userId },
      select: ['ticker'],
    });

    const tickers = Array.from(
      new Set(holdings.map((h) => (h.ticker || '').trim()).filter(Boolean)),
    );

    if (tickers.length === 0) {
      return { tickers: [], from: null, to: null, items: [] };
    }

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 3);

    const from = this.formatDate(fromDate);
    const to = this.formatDate(toDate);

    const perTicker = await Promise.all(
      tickers.map(async (ticker) => {
        const items = await this.getNewsForTicker(ticker, from, to);
        return items.map((n: any) => ({ ...n, ticker }));
      }),
    );

    const items = perTicker.flat().sort((a: any, b: any) => {
      const ta = typeof a?.datetime === 'number' ? a.datetime : 0;
      const tb = typeof b?.datetime === 'number' ? b.datetime : 0;
      return tb - ta; // newest first
    });

    return { tickers, from, to, items };
  }

  
}
