import { IsString, IsOptional, IsInt, Min, Max, Length, Matches } from 'class-validator';

export class CreateGangDto {
  @IsString()
  @Length(2, 20, { message: '幫派名稱長度需介於 2–20 字' })
  @Matches(/^[一-龥a-zA-Z0-9_\-]+$/, { message: '幫派名稱僅允許中英文、數字、底線與連字號' })
  name!: string;

  @IsString()
  @Length(0, 100, { message: '公告長度不得超過 100 字' })
  @IsOptional()
  announcement?: string;
}

export class UpdateGangDto {
  @IsString()
  @Length(0, 100, { message: '公告長度不得超過 100 字' })
  @IsOptional()
  announcement?: string;

  @IsString()
  @Length(0, 200, { message: '描述長度不得超過 200 字' })
  @IsOptional()
  description?: string;
}

export class GangIdParamDto {
  @IsString()
  @Length(1, 60)
  gangId!: string;
}

export class KickMemberDto {
  @IsString()
  @Length(1, 60)
  memberAccountId!: string;
}
