import { Injectable } from '@nestjs/common';
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

  async findAll(userId: number) {
    const portfolioCompanies = await this.portfolioCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'],
      order: { created_at: 'DESC' },
    });

    // Добавляем расчет прибыли/убытка для каждой компании
    // TODO: В будущем можно получать текущую цену из API
    // Пока используем avg_price как базовую цену для расчета
    return portfolioCompanies.map((pc) => {
      const currentPrice = pc.avg_price; // В будущем: получить из API
      const totalInvested = pc.shares * pc.avg_price;
      const currentValue = pc.shares * currentPrice;
      const profitLoss = currentValue - totalInvested;
      const profitLossPercent = totalInvested > 0 
        ? ((profitLoss / totalInvested) * 100) 
        : 0;

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
    });
  }

  async findOne(userId: number, id: number) {
    const portfolioCompany = await this.portfolioCompanyRepository.findOne({
      where: { id, user_id: userId },
      relations: ['company'],
    });

    if (!portfolioCompany) {
      return null;
    }

    // Добавляем расчет прибыли/убытка
    const currentPrice = portfolioCompany.avg_price; // В будущем: получить из API
    const totalInvested = portfolioCompany.shares * portfolioCompany.avg_price;
    const currentValue = portfolioCompany.shares * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 
      ? ((profitLoss / totalInvested) * 100) 
      : 0;

    return {
      id: portfolioCompany.id,
      ticker: portfolioCompany.ticker,
      company: portfolioCompany.company,
      shares: portfolioCompany.shares,
      avg_price: portfolioCompany.avg_price,
      current_price: currentPrice,
      total_invested: totalInvested,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      created_at: portfolioCompany.created_at,
    };
  }

  async findByTicker(userId: number, ticker: string) {
    const portfolioCompany = await this.portfolioCompanyRepository.findOne({
      where: { user_id: userId, ticker },
      relations: ['company'],
    });

    if (!portfolioCompany) {
      return null;
    }

    // Добавляем расчет прибыли/убытка
    const currentPrice = portfolioCompany.avg_price; // В будущем: получить из API
    const totalInvested = portfolioCompany.shares * portfolioCompany.avg_price;
    const currentValue = portfolioCompany.shares * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 
      ? ((profitLoss / totalInvested) * 100) 
      : 0;

    return {
      id: portfolioCompany.id,
      ticker: portfolioCompany.ticker,
      company: portfolioCompany.company,
      shares: portfolioCompany.shares,
      avg_price: portfolioCompany.avg_price,
      current_price: currentPrice,
      total_invested: totalInvested,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      created_at: portfolioCompany.created_at,
    };
  }
}
