import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.newsService.getNewsForUserPortfolioLast3Days(req.user.id);
  }
}
