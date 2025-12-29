// Auth API 클라이언트

export const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3000";

// 개발 환경 여부 확인 (호스트명 또는 환경변수로 판단)
const isDevelopment = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  process.env.NODE_ENV === 'development'
);

// 프로덕션 환경에서 localhost 사용 방지
if (typeof window !== 'undefined' && API_URL === 'http://localhost:3000' && !isDevelopment) {
  console.warn('NEXT_PUBLIC_AUTH_API_URL is not set. Using localhost:3000 (development only)');
}

// API 응답 타입
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
  };
}

// 확장된 인증 응답 타입
export interface ExtendedAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    birthdate: string | null;
    phone: string | null;
    phoneVerified: boolean;
    createdAt: string;
  };
}

// SMS 인증 응답 타입
export interface SmsVerifyResponse {
  verified: boolean;
  verificationId: string;
}

// 확장 회원가입 요청 타입
export interface ExtendedRegisterRequest {
  email: string;
  password: string;
  name: string;
  birthdate: string;
  phone?: string;
  smsVerificationId?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// API 요청 헬퍼
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 개발 환경이 아닌 곳에서 localhost를 사용하면 에러
  const isLocalhost = API_URL === 'http://localhost:3000';
  const isDevEnv = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );
  
  if (!API_URL) {
    console.error('NEXT_PUBLIC_AUTH_API_URL is not set');
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_AUTH_API_URL environment variable.');
  }
  
  // 프로덕션 환경에서 localhost 사용 시 경고 (에러 대신 경고로 변경)
  if (isLocalhost && !isDevEnv) {
    console.warn('Warning: Using localhost API URL in non-development environment');
  }
  
  // URL 구성: API_URL 끝에 슬래시가 있으면 제거, endpoint 시작에 슬래시가 있으면 유지
  const baseUrl = API_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}

// 회원가입
export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// 로그인
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// 토큰 갱신
export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

// 내 정보 조회
export async function getMe(accessToken: string) {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// 로그아웃
export async function logout(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await request("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

// --- SMS API ---

// SMS 인증번호 발송
export async function sendSms(phone: string): Promise<{ message: string; expiresIn: number }> {
  return request("/sms/send", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

// SMS 인증번호 확인
export async function verifySms(phone: string, code: string): Promise<SmsVerifyResponse> {
  return request<SmsVerifyResponse>("/sms/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

// --- 확장 회원가입 API ---

// 확장된 회원가입 (프로필 + 전화번호 인증)
export async function registerExtended(
  data: ExtendedRegisterRequest
): Promise<ExtendedAuthResponse> {
  return request<ExtendedAuthResponse>("/auth/register/extended", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

