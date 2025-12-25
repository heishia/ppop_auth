// JWT 토큰 페이로드 인터페이스
export interface JwtPayload {
  sub: string; // user_id
  email: string;
  type: 'access' | 'refresh';
  iat?: number; // issued at
  exp?: number; // expires at
}

// 토큰 응답 인터페이스
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access Token 만료 시간 (초)
}

// 인증 응답 인터페이스
export interface AuthResponse extends TokenResponse {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
  };
}

