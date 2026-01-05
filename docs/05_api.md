# 05. API Specification

## Auth Server API

Base URL: `https://auth-api.yourdomain.com`

---

## Authentication

### POST /auth/register

회원가입

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error (409):**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

### POST /auth/login

로그인

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### POST /auth/refresh

토큰 갱신

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

---

### POST /auth/logout

로그아웃 (단일 디바이스)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/logout

SSO 로그아웃 (모든 디바이스)

사용자의 모든 세션을 종료하고 지정된 URL로 리다이렉트합니다.

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| returnUrl | No | 로그아웃 후 리다이렉트할 URL (whitelist 검증) |

**Headers (Optional):**
```
Authorization: Bearer {accessToken}
```

**Example:**
```
GET /auth/logout?returnUrl=https://ppoplink.site
```

**Behavior:**
1. JWT 토큰이 있는 경우: 사용자의 모든 refresh token 삭제 (모든 디바이스에서 로그아웃)
2. JWT 토큰이 없는 경우: 세션 삭제 없이 바로 리다이렉트
3. returnUrl이 whitelist에 있는 경우: 해당 URL로 리다이렉트
4. returnUrl이 없거나 유효하지 않은 경우: AUTH_CLIENT_URL로 리다이렉트

**Allowed Domains (Whitelist):**
- 환경변수 `LOGOUT_ALLOWED_DOMAINS`에 설정된 도메인
- 환경변수 `AUTH_CLIENT_URL`에 설정된 도메인
- 개발 환경: `http://localhost:*`, `http://127.0.0.1:*`

**Response:**
```
302 Redirect to returnUrl or AUTH_CLIENT_URL
```

**Security:**
- Open Redirect 방지를 위한 whitelist 검증
- 선택적 인증 (로그인 상태가 아니어도 접근 가능)
- 모든 디바이스의 세션 종료

---

### GET /auth/me

내 정보 조회

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "emailVerified": true,
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## OAuth2 Provider

### GET /oauth/authorize

OAuth2 인증 시작 (SaaS에서 호출)

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| client_id | Yes | SaaS 클라이언트 ID |
| redirect_uri | Yes | 콜백 URI |
| response_type | Yes | `code` 고정 |
| state | Yes | CSRF 방지 랜덤 문자열 |
| scope | No | 요청 권한 (기본: openid profile email) |
| prompt | No | 인증 동작 제어 (`login`, `consent`, `none`) |

**prompt 파라미터:**
| Value | Description |
|-------|-------------|
| `login` | 기존 세션 무시, 항상 로그인 화면 표시 **(권장)** |
| `consent` | 항상 동의 화면 표시 |
| `none` | 세션 없으면 `login_required` 에러 반환 |
| (생략) | 기존 동작 유지 (세션 있으면 자동 인증) |

**Example (권장):**
```
GET /oauth/authorize
  ?client_id=ppop_saas
  &redirect_uri=https://ppop.yourdomain.com/auth/callback
  &response_type=code
  &state=abc123xyz
  &prompt=login
```

> ⚠️ **중요:** 사용자가 로그인 버튼을 클릭했을 때는 항상 `prompt=login`을 사용하세요.
> PPOP Auth 세션이 남아있어도 로그인 화면을 표시합니다.

**Flow:**
1. `prompt=login` → 항상 로그인 페이지로 redirect
2. `prompt=none` + 세션 없음 → redirect_uri로 `error=login_required` 전달
3. (생략) + 세션 있음 → redirect_uri로 code 전달
4. (생략) + 세션 없음 → 로그인 페이지로 redirect

**Success Redirect:**
```
https://ppop.yourdomain.com/auth/callback
  ?code=SplxlOBeZQQYbYS6WxSbIA
  &state=abc123xyz
```

**Error Redirect (prompt=none 사용 시):**
```
https://ppop.yourdomain.com/auth/callback
  ?error=login_required
  &error_description=User%20is%20not%20authenticated
  &state=abc123xyz
```

---

### POST /oauth/token

Authorization Code를 Token으로 교환 또는 Refresh Token으로 갱신

**Headers:**
```
Content-Type: application/json
```

#### Grant Type: authorization_code

Authorization Code를 Access Token으로 교환

**Request Body:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| grant_type | Yes | `authorization_code` |
| code | Yes | 인가 코드 |
| client_id | Yes | 클라이언트 ID |
| client_secret | Yes | 클라이언트 시크릿 |
| redirect_uri | Yes | 원래 요청한 redirect_uri |

**Example:**
```json
{
  "grant_type": "authorization_code",
  "code": "SplxlOBeZQQYbYS6WxSbIA",
  "client_id": "ppop_saas",
  "client_secret": "your_secret",
  "redirect_uri": "https://ppop.yourdomain.com/auth/callback"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

#### Grant Type: refresh_token

Refresh Token으로 새로운 Access Token 발급 (RFC 6749 Section 6)

**Request Body:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| grant_type | Yes | `refresh_token` |
| refresh_token | Yes | 리프레시 토큰 |
| client_id | Yes | 클라이언트 ID |
| client_secret | Yes | 클라이언트 시크릿 |

**Example:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client_id": "ppop_saas",
  "client_secret": "your_secret"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Note:** Token Rotation이 적용되어 새로운 Refresh Token이 발급되고 기존 Refresh Token은 무효화됩니다.

**Error (400):**
```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code expired or invalid"
}
```

**Error (401):**
```json
{
  "error": "invalid_client",
  "error_description": "Invalid client credentials"
}
```

---

## Social Login

### GET /auth/google

Google 로그인 시작

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| redirect | No | 로그인 후 리다이렉트 URL |

**Redirect to Google OAuth**

---

### GET /auth/google/callback

Google 로그인 콜백

**Internal - Google에서 호출**

**성공 시:** 설정된 redirect로 JWT와 함께 리다이렉트

---

### GET /auth/github

GitHub 로그인 시작

---

### GET /auth/github/callback

GitHub 로그인 콜백

---

### GET /auth/kakao

Kakao 로그인 시작

---

### GET /auth/kakao/callback

Kakao 로그인 콜백

---

## Internal APIs (SaaS Server용)

### GET /users/:id

사용자 정보 조회 (서버 간 통신)

**Headers:**
```
Authorization: Bearer {service_token}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "emailVerified": true,
  "status": "ACTIVE"
}
```

---

### GET /.well-known/jwks.json

JWT 공개키 (SaaS에서 토큰 검증용)

**Response (200):**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-id-1",
      "use": "sig",
      "alg": "RS256",
      "n": "0vx7agoebGcQSuu...",
      "e": "AQAB"
    }
  ]
}
```

---

## Error Responses

### 공통 에러 형식

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/auth/login"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - 요청 형식 오류 |
| 401 | Unauthorized - 인증 실패 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found |
| 409 | Conflict - 중복 |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 5 req/min per IP |
| POST /auth/register | 3 req/min per IP |
| POST /auth/refresh | 10 req/min per user |
| Others | 100 req/min per user |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1234567890
```

---

## JWT Structure

### Access Token

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-1"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "type": "access",
    "iat": 1234567890,
    "exp": 1234568790
  }
}
```

### Refresh Token

```json
{
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "type": "refresh",
    "jti": "unique-token-id",
    "iat": 1234567890,
    "exp": 1235172690
  }
}
```

---

## 관련 문서

- [Architecture](04_architecture.md) - 시스템 구조
- [Use Cases](03_usecases.md) - 사용 시나리오
- [SaaS 등록 가이드](07_saas_registration.md) - 새 SaaS 등록 방법
- [SaaS 연동 가이드](09_saas_integration.md) - OAuth 연동 규칙

