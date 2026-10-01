import { IsOptional, IsString, Length } from 'class-validator';
import type { UpdateProfileRequest } from '@shared/api.interface';

export class UpdateProfileDto implements UpdateProfileRequest {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  avatarFrame?: string;
}
