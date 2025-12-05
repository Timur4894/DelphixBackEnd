import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCompanyDto {
  @IsOptional()
  @IsString()
  search?: string; // Поиск по названию или тикеру

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Номер страницы (по умолчанию 1)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Количество элементов на странице (по умолчанию 10)
}



