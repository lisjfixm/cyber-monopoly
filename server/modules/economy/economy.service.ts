import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { monopolyEconomyEvent } from '../../database/schema';
import type { ReportEconomyEventDto } from './dto';

export interface EconomySummary {
  totalCryptoVolume: number;
  totalTaxCollected: number;
  totalDividends: number;
  eventCount: number;
}

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async reportEvent(accountId: string, dto: ReportEconomyEventDto): Promise<{ success: boolean; id: string }> {
    const inserted = await this.db
      .insert(monopolyEconomyEvent)
      .values({
        accountId,
        eventType: dto.eventType,
        amount: dto.amount,
        assetSymbol: dto.assetSymbol ?? null,
        note: dto.note ?? null,
        roomCode: dto.roomCode,
      })
      .returning();

    return { success: true, id: inserted[0].id };
  }

  async getSummary(accountId: string): Promise<EconomySummary> {
    const rows = await this.db
      .select({
        totalCrypto: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'crypto_trade' THEN amount ELSE 0 END), 0)`,
        totalTax: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'tax_payment' THEN amount ELSE 0 END), 0)`,
        totalDividends: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'stock_dividend' THEN amount ELSE 0 END), 0)`,
        eventCount: sql<number>`COUNT(*)`,
      })
      .from(monopolyEconomyEvent)
      .where(eq(monopolyEconomyEvent.accountId, accountId));

    const r = rows[0] ?? { totalCrypto: 0, totalTax: 0, totalDividends: 0, eventCount: 0 };
    return {
      totalCryptoVolume: Number(r.totalCrypto ?? 0),
      totalTaxCollected: Number(r.totalTax ?? 0),
      totalDividends: Number(r.totalDividends ?? 0),
      eventCount: Number(r.eventCount ?? 0),
    };
  }

  async getGlobalSummary(): Promise<EconomySummary> {
    const rows = await this.db
      .select({
        totalCrypto: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'crypto_trade' THEN amount ELSE 0 END), 0)`,
        totalTax: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'tax_payment' THEN amount ELSE 0 END), 0)`,
        totalDividends: sql<number>`COALESCE(SUM(CASE WHEN event_type = 'stock_dividend' THEN amount ELSE 0 END), 0)`,
        eventCount: sql<number>`COUNT(*)`,
      })
      .from(monopolyEconomyEvent);

    const r = rows[0] ?? { totalCrypto: 0, totalTax: 0, totalDividends: 0, eventCount: 0 };
    return {
      totalCryptoVolume: Number(r.totalCrypto ?? 0),
      totalTaxCollected: Number(r.totalTax ?? 0),
      totalDividends: Number(r.totalDividends ?? 0),
      eventCount: Number(r.eventCount ?? 0),
    };
  }
}
