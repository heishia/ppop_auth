// NestJS 연동 헬퍼 (optional peer dependency)

import type { AuthSdkOptions, JwtPayload } from './types';
import { verifyToken } from './verify';

// NestJS Guard를 위한 검증 함수
export async function validateRequest(
  authHeader: string | undefined,
  options: AuthSdkOptions
): Promise<{ valid: boolean; user?: JwtPayload; error?: string }> {
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return { valid: false, error: 'Invalid authorization header' };
  }

  const result = await verifyToken(token, options);
  if (!result.valid) {
    return { valid: false, error: result.error };
  }

  return { valid: true, user: result.payload };
}

// NestJS Guard 예시 (직접 구현 필요)
/*
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { validateRequest } from '@ppop/auth-sdk';

@Injectable()
export class PpopAuthGuard implements CanActivate {
  private options = {
    jwksUri: process.env.AUTH_JWKS_URI || 'http://localhost:3000/.well-known/jwks.json',
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const result = await validateRequest(request.headers.authorization, this.options);
    
    if (!result.valid) {
      throw new UnauthorizedException(result.error);
    }
    
    request.user = result.user;
    return true;
  }
}
*/

