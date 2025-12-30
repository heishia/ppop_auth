# 🔐 통합 관리자 계정 설정 가이드

## 📋 개요

PPOP Auth의 **통합 관리자**는 하나의 계정으로 모든 권한을 가집니다:
- ✅ 모든 SaaS 서비스에서 관리자 기능 사용
- ✅ 다른 사용자에게 관리자 권한 부여/제거
- ✅ 관리자 목록 조회

**간단한 구조:** 관리자 = 모든 권한

---

## 🚀 빠른 시작

### 1. 관리자 계정 생성

```bash
cd auth-server

# Seed 스크립트 실행
npx ts-node prisma/seed.ts
```

**출력 예시:**
```
--- Global Admin User ---
Global Admin User:
  Email: admin@ppop.cloud
  User ID: 6d6ee487-8d14-4de0-985a-2cd06ce685ef
  isGlobalAdmin: true
  Password: ChangeMe123!
```

### 2. 환경변수 설정 (선택사항)

기본값을 변경하려면 `.env` 파일에 설정:

```bash
# auth-server/.env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### 3. 관리자 로그인

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ppop.cloud",
  "password": "ChangeMe123!"
}
```

**응답에서 JWT 토큰 획득:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": { ... }
}
```

JWT를 디코딩하면 `isAdmin: true`가 포함되어 있습니다.

---

## 🔧 관리자 기능

### 1. SaaS 서비스에서 관리자 권한 사용

ppop-link, ppop-editor 등 모든 SaaS에서:

```typescript
// JWT 검증 후
const isAdmin = decodedToken.isAdmin === true;

if (isAdmin) {
  // 관리자 기능 허용
  await createAdminPost(postData);
}
```

### 2. 다른 사용자를 관리자로 지정

```bash
# 관리자 권한 부여
PATCH http://localhost:3000/api/users/{userId}/admin
Authorization: Bearer {관리자_토큰}
Content-Type: application/json

{
  "isAdmin": true
}
```

### 3. 모든 관리자 조회

```bash
GET http://localhost:3000/api/users/admins
Authorization: Bearer {관리자_토큰}
```

---

## 📊 데이터베이스 구조

### User 테이블

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  is_global_admin BOOLEAN DEFAULT false,  -- 👈 관리자 여부
  ...
);

CREATE INDEX users_is_global_admin_idx ON users(is_global_admin);
```

### JWT 토큰 구조

```json
{
  "sub": "user-id",
  "email": "admin@ppop.cloud",
  "type": "access",
  "isAdmin": true,  // 👈 관리자 여부
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🔒 보안

### 프로덕션 환경 설정

```bash
# 강력한 비밀번호 생성
ADMIN_PASSWORD=$(openssl rand -base64 32)

# .env 파일에 저장
echo "ADMIN_EMAIL=admin@yourcompany.com" >> auth-server/.env
echo "ADMIN_PASSWORD=${ADMIN_PASSWORD}" >> auth-server/.env
```

### 관리자 권한 관리

- ⚠️ 관리자는 강력한 권한을 가지므로 신뢰할 수 있는 사용자에게만 부여
- 🔐 관리자 계정은 2FA(이중 인증) 사용 권장
- 📝 관리자 권한 변경 이력을 감사 로그로 기록 (향후 추가 예정)

---

## 🧪 테스트

### 1. 관리자 로그인 테스트

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ppop.cloud","password":"ChangeMe123!"}'
```

### 2. JWT 토큰 확인

https://jwt.io 에서 토큰 디코딩하여 `isAdmin: true` 확인

### 3. 관리자 권한 부여 테스트

```bash
# 일반 사용자 생성
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 관리자 토큰으로 해당 사용자를 관리자로 지정
curl -X PATCH http://localhost:3000/api/users/{userId}/admin \
  -H "Authorization: Bearer {관리자_토큰}" \
  -H "Content-Type: application/json" \
  -d '{"isAdmin":true}'
```

---

## 🚨 문제 해결

### Q: JWT에 isAdmin이 포함되지 않음

**해결:**
```sql
-- 데이터베이스 확인
SELECT id, email, is_global_admin FROM users WHERE email = 'admin@ppop.cloud';

-- 수동으로 관리자 설정
UPDATE users SET is_global_admin = true WHERE email = 'admin@ppop.cloud';
```

다시 로그인하여 새 토큰 발급받기

### Q: 관리자 API 접근 불가 (403 Forbidden)

**원인:** JWT 토큰에 `isAdmin: true`가 없음

**해결:** 위의 데이터베이스 확인 후 재로그인

---

## 📝 요약

| 항목 | 설명 |
|------|------|
| **필드** | `User.isGlobalAdmin` (Boolean) |
| **JWT 클레임** | `isAdmin` (Boolean) |
| **권한** | 모든 SaaS 관리 + 사용자 관리 |
| **생성 방법** | Seed 스크립트 또는 관리자 API |
| **환경변수** | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

---

## 🔗 관련 문서

- [상세 문서](./docs/08_global_admin.md)
- [API 명세](./docs/05_api.md)
- [개발 가이드](./docs/06_dev_guide.md)

