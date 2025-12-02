import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { PortfolioCompany } from '../portfolio-companies/entities/portfolio-company.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PortfolioCompany)
    private readonly portfolioCompanyRepository: Repository<PortfolioCompany>,
  ) {}

  async create(userId: number, companyTicker: string, createTransactionDto: CreateTransactionDto) {
    const { type, quantity, price_per_share, notes } = createTransactionDto;
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

