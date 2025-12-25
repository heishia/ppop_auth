# 02. Domain Model

## 도메인 모델

### 핵심 개념

```
┌─────────────────────────────────────────────────────────┐
│                     Auth Domain                          │
│                                                          │
│  ┌──────────┐     ┌───────────────┐     ┌────────────┐ │
│  │   User   │────<│ RefreshToken  │     │OAuthClient │ │
│  └──────────┘     └───────────────┘     └────────────┘ │
│       │                                        │        │
│       │           ┌───────────────┐            │        │
│       └──────────>│ OAuthAccount  │            │        │
│                   └───────────────┘            │        │
│                                                │        │
│                   ┌───────────────┐            │        │
│                   │Authorization  │<───────────┘        │
│                   │    Code       │                     │
│                   └───────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Entity 정의

### 1. User (사용자)

Auth 서버에 등록된 사용자. 모든 SaaS의 공통 계정.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| email | String | 고유, 로그인 ID |
| password_hash | String | bcrypt 해시 |
| email_verified | Boolean | 이메일 인증 여부 |
| status | Enum | ACTIVE, BANNED, PENDING |
| created_at | DateTime | 가입일 |
| updated_at | DateTime | 수정일 |

**상태 전이:**
```
PENDING ──(이메일 인증)──> ACTIVE ──(관리자)──> BANNED
                              │
                              └──(탈퇴)──> [삭제]
```

---

### 2. RefreshToken

사용자의 리프레시 토큰. 여러 디바이스 지원.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | FK to User |
| token_hash | String | 토큰 해시 |
| device_info | String | 디바이스 정보 (선택) |
| expires_at | DateTime | 만료일 |
| created_at | DateTime | 생성일 |

**정책:**
- 사용자당 최대 5개 토큰 (디바이스 5개)
- 만료된 토큰 자동 삭제
- 로그아웃 시 해당 토큰 삭제

---

### 3. OAuthAccount (소셜 연동)

소셜 로그인 연동 정보.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | FK to User |
| provider | String | google, github, kakao |
| provider_user_id | String | 소셜 서비스의 사용자 ID |
| created_at | DateTime | 연동일 |

**제약:**
- (provider, provider_user_id) UNIQUE
- 하나의 소셜 계정은 하나의 User만 연결

---

### 4. OAuthClient (SaaS 클라이언트)

Auth 서버에 등록된 SaaS 애플리케이션.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| client_id | String | 공개 식별자 |
| client_secret_hash | String | 비밀키 해시 |
| name | String | 앱 이름 |
| redirect_uris | String[] | 허용된 redirect URI |
| created_at | DateTime | 등록일 |

**예시:**
```json
{
  "client_id": "ppop_saas",
  "name": "PPOP Service",
  "redirect_uris": [
    "https://ppop.yourdomain.com/auth/callback",
    "http://localhost:3000/auth/callback"
  ]
}
```

---

### 5. AuthorizationCode

OAuth2 인가 코드. 일회성.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| code | String | 인가 코드 |
| user_id | UUID | FK to User |
| client_id | String | 요청한 클라이언트 |
| redirect_uri | String | 콜백 URI |
| expires_at | DateTime | 만료 (5분) |
| used | Boolean | 사용 여부 |

**정책:**
- 5분 내 사용
- 1회만 사용 가능
- 사용 후 즉시 삭제 또는 used=true

---

## Value Objects

### JWT Payload

Access Token에 포함되는 정보.

```typescript
interface JwtPayload {
  sub: string;      // user_id (UUID)
  email: string;    // 사용자 이메일
  type: 'access';   // 토큰 타입
  iat: number;      // 발급 시간
  exp: number;      // 만료 시간
}
```

**원칙:**
- JWT에는 최소한의 정보만 포함
- 민감 정보 (비밀번호, 결제 등) 절대 포함 X
- 권한 정보는 SaaS가 자체 관리

---

## Aggregate Boundaries

```
┌─────────────────────────────────────┐
│           User Aggregate            │
│  ┌──────────┐                       │
│  │   User   │ (Aggregate Root)      │
│  └──────────┘                       │
│       │                             │
│       ├──> RefreshToken[]           │
│       └──> OAuthAccount[]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        OAuthClient Aggregate        │
│  ┌─────────────┐                    │
│  │ OAuthClient │ (Aggregate Root)   │
│  └─────────────┘                    │
└─────────────────────────────────────┘
```

---

## SaaS Domain (별도 DB)

각 SaaS는 자체 DB에 결제/구독 정보 저장.

### Subscription

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | Auth 서버의 user_id |
| product_code | String | 상품 코드 |
| stripe_subscription_id | String | Stripe ID |
| status | Enum | ACTIVE, CANCELED, PAST_DUE |
| current_period_end | DateTime | 현재 구독 기간 종료 |

### Payment

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | Auth 서버의 user_id |
| amount | Integer | 결제 금액 |
| currency | String | KRW, USD |
| provider | String | stripe, toss |
| status | String | succeeded, failed |
| created_at | DateTime | 결제일 |

---

## 관련 문서

- [Architecture](04_architecture.md) - DB 스키마 상세
- [Use Cases](03_usecases.md) - 엔티티 사용 시나리오

