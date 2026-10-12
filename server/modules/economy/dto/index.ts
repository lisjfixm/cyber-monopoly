import { IsString, IsNumber, IsInt, Min, Max, IsOptional, Length, IsEnum } from 'class-validator';

export enum EconomyEventType {
  CRYPTO_TRADE = 'crypto_trade',
  TAX_PAYMENT = 'tax_payment',
  BOND_MATURE = 'bond_mature',
  STOCK_DIVIDEND = 'stock_dividend',
  PROPERTY_SALE = 'property_sale',
}

export class ReportEconomyEventDto {
  @IsEnum(EconomyEventType, { message: '未知的經濟事件型別' })
  eventType!: EconomyEventType;

  @IsNumber()
  @Min(-1_000_000_000, { message: '金額超出合理下限' })
  @Max(1_000_000_000, { message: '金額超出合理上限' })
  amount!: number;

  @IsString()
  @Length(0, 40)
  @IsOptional()
  assetSymbol?: string;

  @IsString()
  @Length(0, 100)
  @IsOptional()
  note?: string;

  @IsString()
  @Length(1, 40)
  roomCode!: string;
}

export class EconomyQueryDto {
  @IsString()
  @Length(1, 40)
  @IsOptional()
  seasonId?: string;
}
