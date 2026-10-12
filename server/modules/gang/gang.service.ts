import { Inject, Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import {
  monopolyGang,
  monopolyGangMember,
  monopolyAccount,
} from '../../database/schema';
import type { CreateGangDto, UpdateGangDto, KickMemberDto } from './dto';

export interface GangSummary {
  id: string;
  name: string;
  announcement: string | null;
  description: string | null;
  leaderId: string;
  memberCount: number;
  createdAt: Date;
}

@Injectable()
export class GangService {
  private readonly logger = new Logger(GangService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async createGang(accountId: string, dto: CreateGangDto): Promise<GangSummary> {
    // 檢查使用者是否已在某個幫派
    const existing = await this.db
      .select()
      .from(monopolyGangMember)
      .where(eq(monopolyGangMember.accountId, accountId))
      .limit(1);
    if (existing.length > 0) {
      throw new ConflictException('您已加入幫派，請先退出');
    }

    // 檢查重名
    const dup = await this.db
      .select()
      .from(monopolyGang)
      .where(eq(monopolyGang.name, dto.name))
      .limit(1);
    if (dup.length > 0) {
      throw new ConflictException('幫派名稱已被使用');
    }

    const inserted = await this.db
      .insert(monopolyGang)
      .values({
        name: dto.name,
        announcement: dto.announcement ?? null,
        leaderId: accountId,
      })
      .returning();

    const gang = inserted[0];

    await this.db
      .insert(monopolyGangMember)
      .values({
        gangId: gang.id,
        accountId,
        role: 'leader',
      })
      .execute();

    this.logger.log(`幫派建立: ${dto.name} by ${accountId}`);
    return this.toSummary(gang, 1);
  }

  async listGangs(): Promise<GangSummary[]> {
    const rows = await this.db
      .select()
      .from(monopolyGang)
      .orderBy(desc(monopolyGang.createdAt))
      .limit(50);
    return Promise.all(rows.map(async (g: any) => {
      const count = await this.db
        .select({ c: sql<number>`count(*)` })
        .from(monopolyGangMember)
        .where(eq(monopolyGangMember.gangId, g.id));
      return this.toSummary(g, Number(count[0]?.c ?? 0));
    }));
  }

  async getGang(gangId: string): Promise<GangSummary & { members: Array<{ accountId: string; nickname: string; role: string }> }> {
    const gangRows = await this.db
      .select()
      .from(monopolyGang)
      .where(eq(monopolyGang.id, gangId))
      .limit(1);
    if (gangRows.length === 0) throw new NotFoundException('幫派不存在');
    const gang = gangRows[0];

    const memberRows = await this.db
      .select({
        accountId: monopolyGangMember.accountId,
        role: monopolyGangMember.role,
        nickname: monopolyAccount.nickname,
      })
      .from(monopolyGangMember)
      .leftJoin(monopolyAccount, eq(monopolyGangMember.accountId, monopolyAccount.id))
      .where(eq(monopolyGangMember.gangId, gangId));

    const summary = this.toSummary(gang, memberRows.length);
    return {
      ...summary,
      members: memberRows.map((m: any) => ({
        accountId: m.accountId,
        nickname: m.nickname ?? '未知',
        role: m.role,
      })),
    };
  }

  async joinGang(accountId: string, gangId: string): Promise<GangSummary> {
    const gangRows = await this.db
      .select()
      .from(monopolyGang)
      .where(eq(monopolyGang.id, gangId))
      .limit(1);
    if (gangRows.length === 0) throw new NotFoundException('幫派不存在');
    const gang = gangRows[0];

    const existing = await this.db
      .select()
      .from(monopolyGangMember)
      .where(eq(monopolyGangMember.accountId, accountId))
      .limit(1);
    if (existing.length > 0) {
      throw new ConflictException('您已在某個幫派中');
    }

    await this.db
      .insert(monopolyGangMember)
      .values({ gangId, accountId, role: 'member' })
      .execute();

    const countRows = await this.db
      .select({ c: sql<number>`count(*)` })
      .from(monopolyGangMember)
      .where(eq(monopolyGangMember.gangId, gangId));
    return this.toSummary(gang, Number(countRows[0]?.c ?? 0));
  }

  async leaveGang(accountId: string): Promise<{ success: boolean }> {
    const memberRows = await this.db
      .select()
      .from(monopolyGangMember)
      .where(eq(monopolyGangMember.accountId, accountId))
      .limit(1);
    if (memberRows.length === 0) throw new NotFoundException('您不在任何幫派中');
    const member = memberRows[0];

    if (member.role === 'leader') {
      throw new BadRequestException('幫派領袖不能直接退出，請先傳位或解散幫派');
    }

    await this.db
      .delete(monopolyGangMember)
      .where(eq(monopolyGangMember.accountId, accountId))
      .execute();
    return { success: true };
  }

  async updateGang(accountId: string, gangId: string, dto: UpdateGangDto): Promise<GangSummary> {
    const memberRows = await this.db
      .select()
      .from(monopolyGangMember)
      .where(and(
        eq(monopolyGangMember.gangId, gangId),
        eq(monopolyGangMember.accountId, accountId),
      ))
      .limit(1);
    if (memberRows.length === 0) throw new ForbiddenException('您不是此幫派成員');
    if (memberRows[0].role !== 'leader') throw new ForbiddenException('僅幫派領袖可修改');

    const patch: Record<string, unknown> = {};
    if (dto.announcement !== undefined) patch.announcement = dto.announcement;
    if (dto.description !== undefined) patch.description = dto.description;

    const updated = await this.db
      .update(monopolyGang)
      .set(patch)
      .where(eq(monopolyGang.id, gangId))
      .returning();

    const countRows = await this.db
      .select({ c: sql<number>`count(*)` })
      .from(monopolyGangMember)
      .where(eq(monopolyGangMember.gangId, gangId));
    return this.toSummary(updated[0], Number(countRows[0]?.c ?? 0));
  }

  async kickMember(accountId: string, gangId: string, dto: KickMemberDto): Promise<{ success: boolean }> {
    const leaderRows = await this.db
      .select()
      .from(monopolyGangMember)
      .where(and(
        eq(monopolyGangMember.gangId, gangId),
        eq(monopolyGangMember.accountId, accountId),
      ))
      .limit(1);
    if (leaderRows.length === 0 || leaderRows[0].role !== 'leader') {
      throw new ForbiddenException('僅幫派領袖可執行此操作');
    }
    if (dto.memberAccountId === accountId) {
      throw new BadRequestException('不能踢除自己');
    }

    await this.db
      .delete(monopolyGangMember)
      .where(and(
        eq(monopolyGangMember.gangId, gangId),
        eq(monopolyGangMember.accountId, dto.memberAccountId),
      ))
      .execute();
    return { success: true };
  }

  private toSummary(gang: any, memberCount: number): GangSummary {
    return {
      id: gang.id,
      name: gang.name,
      announcement: gang.announcement,
      description: gang.description ?? null,
      leaderId: gang.leaderId,
      memberCount,
      createdAt: gang.createdAt,
    };
  }
}
