import * as jose from 'jose';
import type { AuthSdkOptions, JwtPayload, VerifyResult } from './types';

// JWKS 캐시
interface JwksCache {
  jwks: jose.JSONWebKeySet | null;
  expiresAt: number;
}

const cache: JwksCache = {
  jwks: null,
  expiresAt: 0,
};

// JWKS 가져오기 (캐시 사용)
async function getJwks(
  jwksUri: string,
  cacheTtl: number
): Promise<jose.JSONWebKeySet> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cache.jwks && cache.expiresAt > now) {
    return cache.jwks;
  }

  // JWKS 가져오기
  const response = await fetch(jwksUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }

  const jwks = (await response.json()) as jose.JSONWebKeySet;

  // 캐시 업데이트
  cache.jwks = jwks;
  cache.expiresAt = now + cacheTtl;

  return jwks;
}

// JWT 검증
export async function verifyToken(
  token: string,
  options: AuthSdkOptions
): Promise<VerifyResult> {
  const { jwksUri, cacheTtl = 10 * 60 * 1000, algorithms = ['RS256'] } = options;

  try {
    // JWKS 가져오기
    const jwks = await getJwks(jwksUri, cacheTtl);

    // JWKS에서 키 가져오기
    const JWKS = jose.createLocalJWKSet(jwks);

    // JWT 검증
    const { payload } = await jose.jwtVerify(token, JWKS, {
      algorithms: algorithms as jose.JWTVerifyOptions['algorithms'],
    });

    // 페이로드 타입 확인
    const jwtPayload = payload as unknown as JwtPayload;

    // Access Token인지 확인
    if (jwtPayload.type !== 'access') {
      return {
        valid: false,
        error: 'Invalid token type: expected access token',
      };
    }

    return {
      valid: true,
      payload: jwtPayload,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // 에러 유형별 메시지
    if (message.includes('expired')) {
      return { valid: false, error: 'Token expired' };
    }
    if (message.includes('signature')) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: false, error: message };
  }
}

// 캐시 초기화 (테스트용)
export function clearCache(): void {
  cache.jwks = null;
  cache.expiresAt = 0;
}

