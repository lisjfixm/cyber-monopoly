import { IsInt, IsOptional, Max, Min } from 'class-validator';

// 本地存檔合併請求：僅接受非負整數，並限制單欄位上限，避免用戶端送出異常資料。
export class MergeLocalSaveDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  wins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  losses?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  elo?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  coins?: number;
}
