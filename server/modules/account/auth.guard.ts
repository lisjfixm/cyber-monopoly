import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from './account.service';

declare module 'express' {
  interface Request {
    accountId?: string;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly accountService: AccountService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const token = authHeader.slice(7);
    const accountId = this.accountService.verifyToken(token);

    if (!accountId) {
      throw new UnauthorizedException('令牌无效或已过期');
    }

    req.accountId = accountId;
    return true;
  }
}
