# 03. Use Cases

## 유스케이스

### 1. 회원가입

**Actor:** 신규 사용자

**Precondition:** 없음

**Flow:**
```
1. 사용자가 회원가입 페이지 접속
2. 이메일, 비밀번호 입력
3. Auth 서버에 POST /auth/register
4. 이메일 중복 확인
5. 비밀번호 해싱 (bcrypt)
6. User 생성 (status: PENDING)
7. 인증 이메일 발송 (선택)
8. JWT 발급 및 반환
```

**Postcondition:** User 생성, JWT 발급

**Error Cases:**
- 이메일 중복: 409 Conflict
- 비밀번호 정책 위반: 400 Bad Request

---

### 2. 로그인

**Actor:** 등록된 사용자

**Precondition:** User 존재, status: ACTIVE

**Flow:**
```
1. 사용자가 로그인 페이지 접속
2. 이메일, 비밀번호 입력
3. Auth 서버에 POST /auth/login
4. 이메일로 User 조회
5. 비밀번호 검증 (bcrypt.compare)
6. Access Token + Refresh Token 발급
7. Refresh Token DB 저장
8. 토큰 반환
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 900
}
```

**Error Cases:**
- 사용자 없음: 401 Unauthorized
- 비밀번호 불일치: 401 Unauthorized
- 계정 정지: 403 Forbidden

---

### 3. 토큰 갱신

**Actor:** 로그인된 사용자

**Precondition:** 유효한 Refresh Token

**Flow:**
```
1. 클라이언트가 POST /auth/refresh
2. Refresh Token 검증 (JWT 서명)
3. DB에서 token_hash 확인
4. 만료 여부 확인
5. 새 Access Token 발급
6. (선택) 새 Refresh Token 발급 (Rotation)
7. 토큰 반환
```

**Error Cases:**
- 토큰 만료: 401 Unauthorized
- 토큰 무효: 401 Unauthorized (재로그인 필요)

---

### 4. SaaS 인증 (OAuth2 Flow)

**Actor:** SaaS 사용자

**Precondition:** SaaS가 OAuth Client로 등록됨

**Flow:**
```
1. 사용자가 SaaS A 접속
2. SaaS A가 Auth 서버로 redirect:
   GET /oauth/authorize
     ?client_id=saas_a
     &redirect_uri=https://saas-a.com/callback
     &response_type=code
     &state=random123

3. Auth 서버: 로그인 상태 확인
   - 로그인 안됨 -> 로그인 페이지로
   - 로그인 됨 -> 다음 단계

4. (선택) 동의 화면 표시
   "SaaS A가 다음 권한을 요청합니다..."

5. Authorization Code 생성 (5분 유효)

6. SaaS A로 redirect:
   https://saas-a.com/callback
     ?code=abc123
     &state=random123

7. SaaS A 서버가 Auth 서버에:
   POST /oauth/token
   {
     "grant_type": "authorization_code",
     "code": "abc123",
     "client_id": "saas_a",
     "client_secret": "secret",
     "redirect_uri": "https://saas-a.com/callback"
   }

8. Auth 서버:
   - code 검증
   - client_secret 검증
   - redirect_uri 일치 확인
   - Access Token + Refresh Token 발급

9. SaaS A가 토큰 수신, 세션 생성
```

**Sequence Diagram:**
```
User          SaaS A          Auth Server
 │               │                  │
 │──접속───────>│                   │
 │               │──redirect──────>│
 │               │                  │
 │<────────────로그인 페이지────────│
 │──로그인─────────────────────────>│
 │               │                  │
 │<────────redirect + code─────────│
 │               │<─────────────────│
 │               │                  │
 │               │──code 교환─────>│
 │               │<──tokens────────│
 │               │                  │
 │<──로그인 완료─│                  │
```

---

### 5. 소셜 로그인 (Google)

**Actor:** 사용자

**Precondition:** Google OAuth 설정 완료

**Flow:**
```
1. 사용자가 "Google로 로그인" 클릭
2. Auth 서버 GET /auth/google
3. Google OAuth 페이지로 redirect
4. Google 로그인 및 동의
5. Auth 서버 콜백: GET /auth/google/callback
6. Google에서 사용자 정보 획득
7. OAuthAccount 조회/생성
   - 있으면: 연결된 User로 로그인
   - 없으면: 새 User + OAuthAccount 생성
8. JWT 발급
9. 원래 요청한 SaaS로 redirect
```

**Error Cases:**
- Google 인증 실패: 사용자에게 에러 표시
- 이미 다른 계정에 연결된 Google 계정: 안내 메시지

---

### 6. 결제 (SaaS 내부)

**Actor:** SaaS 사용자

**Precondition:** JWT 보유 (로그인 상태)

**Flow:**
```
1. 사용자가 SaaS에서 "구독하기" 클릭
2. SaaS 서버: JWT에서 user_id 추출
3. Stripe Checkout 세션 생성
   metadata: { user_id: "uuid-1234" }
4. Stripe 결제 페이지로 redirect
5. 사용자 결제 완료
6. Stripe Webhook: checkout.session.completed
7. SaaS 서버:
   - metadata.user_id 확인
   - Subscription 생성
8. 사용자에게 결제 완료 표시
```

**중요:**
- Auth 서버는 결제 로직에 관여하지 않음
- SaaS가 user_id만 사용하여 결제 처리

---

### 7. 로그아웃

**Actor:** 로그인된 사용자

**Flow:**
```
1. 사용자가 로그아웃 클릭
2. POST /auth/logout
   Header: Authorization: Bearer {accessToken}
   Body: { "refreshToken": "..." }
3. DB에서 해당 Refresh Token 삭제
4. (선택) 다른 디바이스도 로그아웃
5. 클라이언트: 토큰 삭제
```

---

## 유스케이스 다이어그램

```
                          ┌─────────────┐
                          │    User     │
                          └──────┬──────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    회원가입      │   │     로그인      │   │   소셜로그인     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                                 │
                                 ▼
                      ┌─────────────────┐
                      │   JWT 발급      │
                      └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │  SaaS 접속  │  │  토큰 갱신  │  │   로그아웃   │
     └─────────────┘  └─────────────┘  └─────────────┘
              │
              ▼
     ┌─────────────┐
     │    결제     │ (SaaS 내부)
     └─────────────┘
```

---

## 관련 문서

- [API](05_api.md) - 엔드포인트별 상세 스펙
- [Architecture](04_architecture.md) - 시스템 구조

