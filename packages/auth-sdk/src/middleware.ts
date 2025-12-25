import type { AuthSdkOptions, JwtPayload } from './types';
import { verifyToken } from './verify';

// Express 미들웨어용 Request 확장
export interface AuthenticatedRequest {
  user?: JwtPayload;
}

// Express 미들웨어 생성
export function createAuthMiddleware(options: AuthSdkOptions) {
  return async (
    req: AuthenticatedRequest & { headers: { authorization?: string } },
    res: { status: (code: number) => { json: (data: unknown) => void } },
    next: () => void
  ) => {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Bearer 토큰 추출
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }

    // 토큰 검증
    const result = await verifyToken(token, options);
    if (!result.valid) {
      return res.status(401).json({ message: result.error });
    }

    // 사용자 정보 추가
    req.user = result.payload;
    next();
  };
}

// Authorization 헤더에서 토큰 추출
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) return null;

  return token;
}

