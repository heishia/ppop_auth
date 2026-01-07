export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  emailVerified?: boolean;
  isAdmin?: boolean;
  iat: number;
  exp: number;
}

// SDK 설정 옵션
export interface AuthSdkOptions {
  // JWKS 엔드포인트 URL
  jwksUri: string;
  // 캐시 TTL (밀리초, 기본: 10분)
  cacheTtl?: number;
  // 허용할 알고리즘 (기본: ['RS256'])
  algorithms?: string[];
}

// 검증 결과
export interface VerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

