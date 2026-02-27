import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { PortfolioCompany } from '../portfolio-companies/entities/portfolio-company.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PortfolioCompany)
    private readonly portfolioCompanyRepository: Repository<PortfolioCompany>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  private async getCurrentPriceForTicker(ticker: string): Promise<number> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('FINNHUB_API_KEY is not set');
    }

    if (!ticker?.trim()) {
      throw new BadRequestException('Ticker is required');
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
      if (!price || price <= 0) {
        throw new InternalServerErrorException(
          'Failed to get valid current price from Finnhub',
        );
      }
      return price;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch current price from Finnhub',
      );
    }
  }

  private async ensureCompanyExists(ticker: string): Promise<void> {
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) {
      throw new BadRequestException('Ticker is required');
    }

    const existing = await this.companyRepository.findOne({
      where: { ticker: cleanTicker },
    });
    if (existing) return;

    const company = this.companyRepository.create({
      ticker: cleanTicker,
      name: cleanTicker,
    });
    await this.companyRepository.save(company);
  }

  async create(userId: number, companyTicker: string, createTransactionDto: CreateTransactionDto) {
    const { type, quantity, notes } = createTransactionDto;

    // Гарантируем, что компания существует в таблице companies (для FK)
    await this.ensureCompanyExists(companyTicker);

    // Берем актуальную цену акции с Finnhub
    const price_per_share = await this.getCurrentPriceForTicker(companyTicker);
    const total_cost = quantity * price_per_share;

    // Создаем транзакцию
    const transaction = this.transactionRepository.create({
      user_id: userId,
      company_ticker: companyTicker,
      type,
      quantity,
      price_per_share,
      total_cost,
      date: new Date(),
      notes,
    });

    await this.transactionRepository.save(transaction);

    // Обновляем портфель
    if (type === 'BUY') {
      await this.handleBuy(userId, companyTicker, quantity, price_per_share);
    } else if (type === 'SELL') {
      await this.handleSell(userId, companyTicker, quantity);
    }

    return {
      transaction,
      message: `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} shares`,
    };
  }

  private async handleBuy(userId: number, ticker: string, quantity: number, price: number) {
    // Ищем существующую запись в портфеле
    const existing = await this.portfolioCompanyRepository.findOne({
      where: { user_id: userId, ticker },
    });

    if (existing) {
      // Пересчитываем среднюю цену
      const totalShares = existing.shares + quantity;
      const totalCost = existing.shares * existing.avg_price + quantity * price;
      const newAvgPrice = totalCost / totalShares;

      existing.shares = totalShares;
      existing.avg_price = newAvgPrice;
      await this.portfolioCompanyRepository.save(existing);
    } else {
      // Создаем новую запись
      const portfolioCompany = this.portfolioCompanyRepository.create({
        user_id: userId,
        ticker,
        shares: quantity,
        avg_price: price,
      });
      await this.portfolioCompanyRepository.save(portfolioCompany);
    }
  }

  private async handleSell(userId: number, ticker: string, quantity: number) {
    const existing = await this.portfolioCompanyRepository.findOne({
      where: { user_id: userId, ticker },
    });

    if (!existing) {
      throw new BadRequestException('You don\'t have any shares of this company to sell');
    }

    if (existing.shares < quantity) {
      throw new BadRequestException(
        `You only have ${existing.shares} shares, but trying to sell ${quantity}`,
      );
    }

    // Уменьшаем количество акций
    existing.shares -= quantity;

    if (existing.shares === 0) {
      // Если акций не осталось, удаляем запись
      await this.portfolioCompanyRepository.remove(existing);
    } else {
      // Средняя цена остается прежней
      await this.portfolioCompanyRepository.save(existing);
    }
  }

  async getUserTransactions(userId: number) {
    return this.transactionRepository.find({
      where: { user_id: userId },
      order: { date: 'DESC' },
      relations: ['company'],
    });
  }

  async getCompanyTransactions(userId: number, companyTicker: string) {
    return this.transactionRepository.find({
      where: { user_id: userId, company_ticker: companyTicker },
      order: { date: 'DESC' },
      relations: ['company'],
    });
  }
}




