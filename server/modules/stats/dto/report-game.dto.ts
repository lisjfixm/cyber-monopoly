import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

// 完賽結果回報：所有輸入皆有明確邊界，防止用戶端送出異常數值污染戰績統計。
export class ReportGameDto {
  @IsString()
  @Length(1, 64, { message: 'visitorId 長度需在 1-64 字元' })
  visitorId!: string;

  @IsString()
  @Length(1, 64, { message: '勝者 ID 長度需在 1-64 字元' })
  winnerVisitorId!: string;

  // 本場我的名次（1 = 冠軍）
  @IsInt()
  @Min(1, { message: '名次最小為 1' })
  @Max(6, { message: '名次最大為 6' })
  myRank!: number;

  @IsInt()
  @Min(0, { message: '回合數不可為負數' })
  @Max(5000, { message: '回合數超出合理範圍' })
  totalTurns!: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: '資產不可為負數' })
  @Max(1_000_000_000, { message: '資產超出合理範圍' })
  myAssets?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8, { message: '對手數量最多 8 人' })
  opponentIds?: string[];

  // 可指定賽季（YYYY-MM）；未指定時由伺服器以伺服器時間帶入
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: '賽季格式需為 YYYY-MM' })
  season?: string;
}
