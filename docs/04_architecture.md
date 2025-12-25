# 04. Architecture

## 시스템 아키텍처

### 전체 구조

```
                           ┌─────────────────────┐
                           │   Load Balancer     │
                           │     (Railway)       │
                           └──────────┬──────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Auth Server   │        │   Auth Client   │        │    SaaS Apps    │
│    (NestJS)     │        │   (Next.js)     │        │   (Any Stack)   │
│                 │        │                 │        │                 │
│ auth-api.domain │        │ auth.domain.com │        │ app.domain.com  │
└────────┬────────┘        └─────────────────┘        └────────┬────────┘
         │                                                      │
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐                                   ┌─────────────────┐
│    Supabase     │                                   │    SaaS DB      │
│  (PostgreSQL)   │                                   │  (PostgreSQL)   │
│                 │                                   │                 │
│ - users         │                                   │ - subscriptions │
│ - refresh_tokens│                                   │ - payments      │
│ - oauth_clients │                                   │ - features      │
└─────────────────┘                                   └─────────────────┘
```

---

## 컴포넌트 상세

### 1. Auth Server (NestJS)

**역할:** 중앙 인증 서버

**기술 스택:**
- Runtime: Node.js 20+
- Framework: NestJS
- Language: TypeScript
- ORM: Prisma
- Auth: Passport.js

**모듈 구조:**
```
src/
├── app.module.ts
├── main.ts
│
├── auth/                 # 인증 모듈
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── local.strategy.ts    # 이메일/비밀번호
│   │   ├── jwt.strategy.ts      # Access Token 검증
│   │   └── refresh.strategy.ts  # Refresh Token 검증
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── local-auth.guard.ts
│
├── oauth/                # OAuth2 Provider
│   ├── oauth.module.ts
│   ├── oauth.controller.ts
│   └── oauth.service.ts
│
├── users/                # 사용자 관리
│   ├── users.module.ts
│   ├── users.service.ts
│   └── users.repository.ts
│
├── social/               # 소셜 로그인
│   ├── social.module.ts
│   ├── google.strategy.ts
│   ├── github.strategy.ts
│   └── kakao.strategy.ts
│
└── common/               # 공통
    ├── config/
    ├── filters/
    ├── interceptors/
    └── decorators/
```

---

### 2. Auth Client (Next.js)

**역할:** 공통 로그인 UI

**기술 스택:**
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- State: React Query

**페이지 구조:**
```
app/
├── login/
│   └── page.tsx          # 로그인
├── register/
│   └── page.tsx          # 회원가입
├── reset-password/
│   └── page.tsx          # 비밀번호 재설정
├── oauth/
│   └── authorize/
│       └── page.tsx      # OAuth 동의 화면
└── callback/
    └── [provider]/
        └── page.tsx      # 소셜 로그인 콜백
```

---

### 3. SaaS Application

**역할:** 비즈니스 로직 + 결제

**특징:**
- Auth 서버에서 발급한 JWT만 검증
- 자체 DB에 구독/결제 정보 저장
- user_id로 사용자 식별

**JWT 검증 흐름:**
```
1. Request Header: Authorization: Bearer {token}
2. JWT 서명 검증 (RS256 공개키)
3. 만료 시간 확인
4. user_id 추출
5. 요청 처리
```

---

## 인증 흐름

### JWT 기반 인증

**토큰 구조:**

```
Access Token (15분)
{
  "sub": "uuid-1234",      // user_id
  "email": "user@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}

Refresh Token (7일)
{
  "sub": "uuid-1234",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1235172690
}
```

**알고리즘:** RS256 (비대칭키)
- Auth 서버: 비밀키로 서명
- SaaS: 공개키로 검증

---

### OAuth2 Authorization Code Flow

```
┌──────────┐                              ┌──────────┐                              ┌──────────┐
│  User    │                              │  SaaS    │                              │  Auth    │
│ Browser  │                              │ Server   │                              │ Server   │
└────┬─────┘                              └────┬─────┘                              └────┬─────┘
     │                                         │                                         │
     │─────────── 1. SaaS 접속 ───────────────>│                                         │
     │                                         │                                         │
     │<── 2. Redirect to Auth ─────────────────│                                         │
     │     /oauth/authorize?client_id=...      │                                         │
     │                                         │                                         │
     │───────────────────────────── 3. 로그인 페이지 요청 ─────────────────────────────>│
     │                                         │                                         │
     │<────────────────────────────── 4. 로그인 페이지 ─────────────────────────────────│
     │                                         │                                         │
     │───────────────────────────── 5. 로그인 (이메일/비밀번호) ───────────────────────>│
     │                                         │                                         │
     │<──────────────────────── 6. Redirect + code ────────────────────────────────────│
     │     /callback?code=abc123               │                                         │
     │                                         │                                         │
     │─────────── 7. Callback 요청 ───────────>│                                         │
     │                                         │                                         │
     │                                         │──── 8. Code 교환 ────────────────────>│
     │                                         │     POST /oauth/token                   │
     │                                         │     { code, client_secret }             │
     │                                         │                                         │
     │                                         │<─── 9. Tokens ────────────────────────│
     │                                         │     { access_token, refresh_token }     │
     │                                         │                                         │
     │<──────── 10. 로그인 완료 ───────────────│                                         │
     │                                         │                                         │
```

---

## 데이터베이스 스키마

### Auth Server DB (Supabase)

```sql
-- 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh Token
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OAuth 소셜 연동
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- SaaS 클라이언트 등록
CREATE TABLE oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Authorization Code (임시)
CREATE TABLE authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_authorization_codes_code ON authorization_codes(code);
```

### SaaS DB (별도)

```sql
-- 구독
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Auth 서버의 user_id
    product_code VARCHAR(50) NOT NULL,
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_code)
);

-- 결제 내역
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    provider VARCHAR(20) DEFAULT 'stripe',
    status VARCHAR(20) NOT NULL,
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Railway                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Server  │  │ Auth Client  │  │   SaaS App   │      │
│  │   (NestJS)   │  │  (Next.js)   │  │   (NestJS)   │      │
│  │              │  │              │  │              │      │
│  │ auth-api.    │  │ auth.        │  │ app.         │      │
│  │ domain.com   │  │ domain.com   │  │ domain.com   │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                    │              │
└─────────┼────────────────────────────────────┼──────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────┐                   ┌─────────────────┐
│    Supabase     │                   │    Supabase     │
│  (Auth DB)      │                   │   (SaaS DB)     │
└─────────────────┘                   └─────────────────┘
```

---

## 보안 설계

### 1. 비밀번호

- **해싱:** bcrypt (cost factor: 12)
- **정책:** 최소 8자, 영문+숫자

### 2. JWT

- **알고리즘:** RS256
- **Access Token:** 15분
- **Refresh Token:** 7일, DB 저장

### 3. OAuth2

- **PKCE:** 권장 (모바일)
- **State:** CSRF 방지
- **Code 유효시간:** 5분

### 4. 통신

- **HTTPS:** 필수
- **CORS:** 허용된 origin만
- **Rate Limiting:** 로그인 5회/분

---

## 확장 전략

### 수평 확장

```
                    Load Balancer
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Auth Server │  │ Auth Server │  │ Auth Server │
│  Instance 1 │  │  Instance 2 │  │  Instance 3 │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
                   ┌───────────┐
                   │ Supabase  │
                   │  (Shared) │
                   └───────────┘
```

**Stateless 설계로 인스턴스 추가만으로 확장 가능**

### 캐싱 (추후)

```
Auth Server ──> Redis ──> Supabase
              (Session)
```

---

## 관련 문서

- [API](05_api.md) - 상세 API 명세
- [Dev Guide](06_dev_guide.md) - 개발 환경 설정
- [ADR-001](decisions/ADR_001_auth_strategy.md) - 인증 전략 결정

