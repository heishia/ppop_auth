// JWT 페이로드 타입
export interface JwtPayload {
  sub: string; // user_id (UUID)
  email: string;
  type: 'access' | 'refresh';
  iat: number; // issued at (Unix timestamp)
  exp: number; // expires at (Unix timestamp)
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

