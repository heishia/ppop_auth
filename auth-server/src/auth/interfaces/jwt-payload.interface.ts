export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  emailVerified?: boolean;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
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

// 확장된 인증 응답 인터페이스 (프로필 정보 포함)
export interface ExtendedAuthResponse extends TokenResponse {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    birthdate: string | null;
    phone: string | null;
    phoneVerified: boolean;
    createdAt: Date;
  };
}

export interface PendingRegistrationResponse {
  message: string;
  email: string;
  expiresIn: number;
}
