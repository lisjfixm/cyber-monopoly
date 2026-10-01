import { IsString, Length, Matches } from 'class-validator';
import type { RegisterRequest } from '@shared/api.interface';

export class RegisterDto implements RegisterRequest {
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9]+$/, { message: '用户名只能包含英文字母和数字' })
  username!: string;

  @IsString()
  @Length(6, 255)
  password!: string;

  @IsString()
  @Length(2, 20)
  nickname!: string;
}
