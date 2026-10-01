import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';

// 生產環境必須通過環境變量 GM_HMAC_SECRET 注入強隨機密鑰。
// 此處預設值僅供本地開發使用，禁止用於生產。
const GM_HMAC_SECRET =
  process.env.GM_HMAC_SECRET || 'dev-only-insecure-secret-change-me';
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export function generateGmToken(gmId: string): { token: string; expiresAt: Date } {
  const timestamp = Date.now();
  const expiresAt = new Date(timestamp + TOKEN_TTL_MS);
  const tsBase64 = Buffer.from(String(timestamp)).toString('base64');
  const idBase64 = Buffer.from(gmId).toString('base64');
  const signature = createHmac('sha256', GM_HMAC_SECRET)
    .update(`gm_${tsBase64}_${idBase64}`)
    .digest('hex');
  const token = `gm_${tsBase64}_${idBase64}_${signature}`;
  return { token, expiresAt };
}

export function verifyGmToken(token: string): { valid: boolean; gmId: string } {
  if (!token.startsWith('gm_')) return { valid: false, gmId: '' };

  const parts = token.slice(3).split('_');
  if (parts.length !== 3) return { valid: false, gmId: '' };

  const [tsBase64, idBase64, signature] = parts;
  const expectedSignature = createHmac('sha256', GM_HMAC_SECRET)
    .update(`gm_${tsBase64}_${idBase64}`)
    .digest('hex');

  if (signature !== expectedSignature) return { valid: false, gmId: '' };

  const timestamp = Number(Buffer.from(tsBase64, 'base64').toString('utf8'));
  if (Number.isNaN(timestamp)) return { valid: false, gmId: '' };
  if (Date.now() - timestamp > TOKEN_TTL_MS) return { valid: false, gmId: '' };

  let gmId = '';
  try {
    gmId = Buffer.from(idBase64, 'base64').toString('utf8');
  } catch {
    return { valid: false, gmId: '' };
  }

  return { valid: true, gmId };
}

@Injectable()
export class GmAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      gmId?: string;
    }>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('缺少 GM 認證令牌');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('認證格式錯誤');
    }

    const result = verifyGmToken(token);
    if (!result.valid) {
      throw new UnauthorizedException('GM 令牌無效或已過期');
    }

    request.gmId = result.gmId;
    return true;
  }
}
