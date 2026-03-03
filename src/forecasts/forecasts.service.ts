import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsService } from '../news/news.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Forecast } from './entities/forecast.entity';

@Injectable()
export class ForecastsService {
  private generativeAI: GoogleGenerativeAI;

  constructor(
    private readonly newsService: NewsService,
    @InjectRepository(Forecast)
    private readonly forecastRepository: Repository<Forecast>,
  ) {
    this.generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateForecasts(prompt: string) {
    const model = this.generativeAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  }

  async getPersonalForecasts(userId: number) {
    // 1. Проверяем, есть ли свежий (меньше часа) прогноз в базе
    const latest = await this.forecastRepository.findOne({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
    });

    if (latest) {
      const now = Date.now();
      const lastTime = new Date(latest.timestamp).getTime();
      const diffMs = now - lastTime;
      const oneHourMs = 60 * 60 * 1000;

      if (diffMs < oneHourMs && Array.isArray(latest.results)) {
        return latest.results;
      }
    }

    // 2. Если свежего прогноза нет — генерируем новый
    const newsContext = await this.newsService.getNewsForUserPortfolioLast3Days(
      userId,
    );
    const { tickers, items } = newsContext || {};

    if (!tickers || tickers.length === 0) {
      return [];
    }

    const limitedItems = Array.isArray(items) ? items.slice(0, 40) : [];

    const newsLines = limitedItems
      .map((n: any) => {
        const t = n?.ticker || n?.related || '';
        const headline = n?.headline || n?.title || '';
        const summary = n?.summary || n?.text || '';
        return `Ticker: ${t} | Headline: ${headline} | Summary: ${summary}`;
      })
      .join('\n');

    const prompt = `
You are an investment assistant creating high-level AI forecasts for a retail investor.

The user currently OWNS ONLY these tickers in their portfolio:
${tickers.join(', ')}

You are given recent news for these companies from the last 3 days:

${newsLines || 'NO_NEWS_AVAILABLE'}

TASK:
Based ONLY on these companies and ONLY on this news (do NOT invent other tickers),
generate 3-6 personalized recommendations in the following EXACT JSON format (no comments, no extra text):

[
  {
    "id": 1,
    "type": "buy" | "hold" | "sell",
    "stock": { "name": "Company Name", "shortName": "TICKER" },
    "reason": "Short explanation in 1-3 sentences, based on the news and portfolio context.",
    "confidence": 0-100,
    "timeframe": "Human-readable timeframe (e.g. '1-3 months')"
  }
]

STRICT RULES:
- Use only tickers from this list: ${tickers.join(', ')}.
- "stock.shortName" MUST be exactly one of these tickers.
- If there is no strong basis to 'buy' or 'sell', prefer 'hold'.
- Return ONLY valid JSON array as described, without any additional text before or after.
`.trim();

    const raw = await this.generateForecasts(prompt);

    const cleanJsonResponse = (text: string = raw) => {
      return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    const cleaned = cleanJsonResponse(raw);

    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        throw new Error('AI response is not an array');
      }

      // Сохраняем новый прогноз в базу, чтобы переиспользовать в течение часа
      await this.forecastRepository.save({
        user_id: userId,
        results: parsed,
      });

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI forecasts JSON:', error, raw);
      throw new InternalServerErrorException(
        'Failed to generate AI forecasts. Please try again later.',
      );
    }
  }
}
