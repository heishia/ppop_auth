# PPOP Auth

> 멀티 SaaS를 위한 중앙 인증 서버 + Auth SDK

```
[Auth Server] ──JWT──> [SaaS A] [SaaS B] [SaaS C] ...
      │
  Supabase (PostgreSQL)
```

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. RSA 키 생성

```bash
node scripts/generate-keys.js
```

### 3. 환경 변수 설정

```bash
# Auth Server
cp auth-server/env.example auth-server/.env
# auth-server/.env 파일을 열어 Supabase 인증 정보를 입력하세요

# Auth Client
cp auth-client/env.example auth-client/.env.local
```

### 4. 데이터베이스 마이그레이션

```bash
cd auth-server
npx prisma migrate dev
```

### 5. 개발 서버 실행

```bash
# 터미널 1: Auth Server (포트 3000)
cd auth-server
npm run start:dev

# 터미널 2: Auth Client (포트 3001)
cd auth-client
npm run dev
```

## 아키텍처

```
auth.yourdomain.com          saas-a.yourdomain.com
+-----------------+          +-----------------+
|   Auth Server   |---JWT--->|     SaaS A      |
|    (NestJS)     |          |   (Any Stack)   |
+--------+--------+          +--------+--------+
         |                            |
         v                            v
   +-----------+               +-----------+
   | Supabase  |               |  SaaS DB  |
   |  (Auth)   |               | (Billing) |
   +-----------+               +-----------+
```

### 핵심 원칙

**Auth 서버의 책임:**
- 회원 관리 (가입, 탈퇴, 계정 상태)
- 인증 (로그인, 비밀번호 검증)
- JWT Access/Refresh Token 발급
- OAuth2 Provider 역할

**Auth 서버가 하지 않는 것:**
- 결제 처리 (각 SaaS에서 담당)
- 권한 관리 (SaaS별로 자체 관리)
- 비즈니스 로직 (SaaS 고유 기능)

## 프로젝트 구조

```
ppop_auth/
+-- auth-server/          # NestJS 인증 서버
|   +-- src/
|   |   +-- auth/         # 인증 모듈 (로그인, 회원가입, JWT)
|   |   +-- oauth/        # OAuth2 Provider
|   |   +-- users/        # 사용자 관리
|   |   +-- jwks/         # JWKS 엔드포인트
|   |   +-- prisma/       # 데이터베이스
|   +-- prisma/           # Prisma 스키마
|
+-- auth-client/          # Next.js 로그인 UI
|   +-- app/
|   |   +-- login/        # 로그인 페이지
|   |   +-- register/     # 회원가입 페이지
|   |   +-- oauth/        # OAuth 인증 페이지
|   +-- components/       # UI 컴포넌트
|   +-- lib/              # 유틸리티
|
+-- packages/
|   +-- auth-sdk/         # JWT 검증 SDK (npm 패키지)
|
+-- docs/                 # 문서
+-- keys/                 # RSA 키 (gitignore 대상)
+-- scripts/              # 유틸리티 스크립트
```

## 문서

| 문서 | 설명 |
|------|------|
| [Overview](docs/00_overview.md) | 프로젝트 개요 |
| [Requirements](docs/01_requirements.md) | 기능 요구사항 |
| [Domain](docs/02_domain.md) | 도메인 모델 |
| [Use Cases](docs/03_usecases.md) | 유스케이스 |
| [Architecture](docs/04_architecture.md) | 시스템 아키텍처 |
| [API](docs/05_api.md) | API 명세 |
| [Dev Guide](docs/06_dev_guide.md) | 개발 가이드 |

## 기술 스택

| 구성요소 | 기술 |
|----------|------|
| Auth Server | NestJS + TypeScript |
| Auth Client | Next.js 14 + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| 인증 방식 | JWT (RS256) + OAuth2 |
| SDK | TypeScript + jose |

## API 엔드포인트

### Auth Server

| 엔드포인트 | 메소드 | 설명 |
|------------|--------|------|
| `/auth/register` | POST | 회원가입 |
| `/auth/login` | POST | 로그인 |
| `/auth/refresh` | POST | 토큰 갱신 |
| `/auth/logout` | POST | 로그아웃 |
| `/auth/me` | GET | 현재 사용자 정보 조회 |
| `/oauth/authorize` | GET | OAuth2 인증 |
| `/oauth/token` | POST | 인증 코드로 토큰 교환 |
| `/.well-known/jwks.json` | GET | JWT 검증용 공개키 |

## SaaS에서 Auth SDK 사용하기

### 설치

```bash
npm install @ppop/auth-sdk
```

### 기본 사용법

```typescript
import { verifyToken } from '@ppop/auth-sdk';

const result = await verifyToken(token, {
  jwksUri: 'https://auth-api.yourdomain.com/.well-known/jwks.json',
});

if (result.valid) {
  console.log('User:', result.payload.sub);
}
```

### Express 미들웨어로 사용

```typescript
import { createAuthMiddleware } from '@ppop/auth-sdk/middleware';

const authMiddleware = createAuthMiddleware({
  jwksUri: 'https://auth-api.yourdomain.com/.well-known/jwks.json',
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

### NestJS Guard로 사용

```typescript
import { PpopAuthModule, JwtAuthGuard } from '@ppop/auth-sdk/nestjs';

@Module({
  imports: [
    PpopAuthModule.forRoot({
      jwksUri: 'https://auth-api.yourdomain.com/.well-known/jwks.json',
    }),
  ],
})
export class AppModule {}

// 컨트롤러에서 사용
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected() {
  return { message: 'Protected resource' };
}
```

## 환경 변수

### Auth Server

```env
# 데이터베이스
DATABASE_URL=postgresql://...

# JWT 설정
JWT_PRIVATE_KEY_PATH=../keys/private.pem
JWT_PUBLIC_KEY_PATH=../keys/public.pem
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 서버 설정
AUTH_SERVER_PORT=3000
AUTH_CLIENT_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001
```

### Auth Client

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3000
```

## npm 스크립트

```bash
# 개발 서버 실행
npm run dev:server    # Auth Server 실행
npm run dev:client    # Auth Client 실행

# 빌드
npm run build         # 전체 빌드
npm run build:server  # Auth Server만 빌드
npm run build:client  # Auth Client만 빌드
npm run build:sdk     # Auth SDK만 빌드

# 데이터베이스
npm run db:migrate    # Prisma 마이그레이션 실행
npm run db:generate   # Prisma 클라이언트 생성
npm run db:seed       # 시드 데이터 삽입

# 유틸리티
npm run generate:keys # RSA 키 생성
```

## 용어 정의

| 용어 | 정의 |
|------|------|
| Auth Server | 중앙 인증 서버. 로그인/토큰 발급 담당 |
| Auth Client | 공통 로그인 UI (auth.domain.com) |
| Auth SDK | SaaS에서 JWT 검증용 npm 패키지 |
| SaaS | Auth Server에 인증을 위임하는 개별 서비스 |
| OAuth Client | Auth Server에 등록된 SaaS 애플리케이션 |
| JWT | JSON Web Token. 사용자 인증 정보가 담긴 토큰 |
| user_id | Auth Server가 발급하는 사용자 고유 식별자 (UUID) |

## 요구사항

- Node.js >= 20.0.0
- npm >= 10.0.0

## 라이센스

Private
