import { IsString, IsInt, Min, Max, IsOptional, Length, IsNumber } from 'class-validator';

export class ReportSeasonScoreDto {
  @IsString()
  @Length(1, 40)
  seasonId!: string;

  @IsNumber()
  @Min(0, { message: '賽季積分不得為負數' })
  @Max(10_000_000, { message: '賽季積分超出上限' })
  score!: number;

  @IsInt()
  @Min(0)
  @Max(10000, { message: '對局數超出合理範圍' })
  gamesPlayed!: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  wins!: number;
}

export class SeasonIdParamDto {
  @IsString()
  @Length(1, 40)
  seasonId!: string;
}
