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
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

