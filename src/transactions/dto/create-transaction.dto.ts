import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: 'BUY' | 'SELL';

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantity: number; // Количество акций

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  price_per_share: number; // Цена за акцию

  @IsString()
  @IsOptional()
  notes?: string;
}

