# PPOP Auth 서비스 구독 권한 시스템 연동 가이드

## 개요

PPOP Auth는 중앙화된 인증 및 구독 관리 시스템입니다. 다른 SaaS 서비스에서 이 시스템을 연동하여 사용자의 구독 상태(BASIC/PRO)를 확인하고 권한을 제어할 수 있습니다.

## 구독 플랜 구조

### SubscriptionPlan Enum
- **NONE**: 서비스 사용 불가
- **BASIC**: 무료 플랜 (회원가입 + 후기 유도 목적)
- **PRO**: 유료 플랜

### SubscriptionStatus Enum
- **ACTIVE**: 활성 상태
- **CANCELLED**: 취소됨
- **EXPIRED**: 만료됨

## 데이터베이스 스키마

### Service 테이블
```typescript
{
  id: string (UUID)
  code: string (unique) // 서비스 코드 (예: 'ppop-editor', 'ppop-link')
  name: string
  description?: string
  gumroadProductId?: string // Gumroad 상품 ID (선택)
}
```

### Subscription 테이블
```typescript
{
  id: string (UUID)
  userId: string
  serviceCode: string // 서비스 코드
  plan: SubscriptionPlan (NONE | BASIC | PRO)
  status: SubscriptionStatus (ACTIVE | CANCELLED | EXPIRED)
  gumroadSaleId?: string // Gumroad 구매 ID
  purchasedAt?: Date
  expiresAt?: Date // null이면 평생 라이센스
}
```

**제약조건**: `userId` + `serviceCode` 조합은 유니크합니다.

## API 엔드포인트

### Base URL
```
https://auth-api.yourdomain.com
```

### 1. 사용자 구독 상태 조회 (인증 필요)

**엔드포인트**: `GET /api/subscriptions/:serviceCode`

**인증**: JWT Bearer Token 필요

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답 (200)**:
```json
{
  "hasAccess": true,  // BASIC 또는 PRO면 true
  "plan": "PRO",      // "NONE" | "BASIC" | "PRO"
  "status": "ACTIVE", // "ACTIVE" | "CANCELLED" | "EXPIRED" | "NONE"
  "expiresAt": "2025-12-31T23:59:59Z" // null이면 평생 라이센스
}
```

**응답 예시 (구독 없음)**:
```json
{
  "hasAccess": false,
  "plan": "NONE",
  "status": "NONE"
}
```

**에러 응답 (401)**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 2. 사용자의 모든 구독 목록 조회

**엔드포인트**: `GET /api/subscriptions`

**인증**: JWT Bearer Token 필요

**응답 (200)**:
```json
{
  "subscriptions": [
    {
      "serviceCode": "ppop-editor",
      "serviceName": "PPOP Editor",
      "plan": "PRO",
      "status": "ACTIVE",
      "purchasedAt": "2024-01-01T00:00:00Z",
      "expiresAt": null
    },
    {
      "serviceCode": "ppop-link",
      "serviceName": "PPOP Link",
      "plan": "BASIC",
      "status": "ACTIVE",
      "purchasedAt": "2024-01-15T00:00:00Z",
      "expiresAt": null
    }
  ]
}
```

### 3. 서비스 목록 조회 (공개)

**엔드포인트**: `GET /api/services`

**인증**: 불필요

**응답 (200)**:
```json
{
  "services": [
    {
      "id": "uuid",
      "code": "ppop-editor",
      "name": "PPOP Editor",
      "description": "에디터 서비스",
      "gumroadProductId": "product-id-123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 관리자 API (Make/Zapier 자동화용)

### 관리자 API 키 설정

관리자 API를 사용하려면 `ADMIN_API_KEY` 환경 변수를 설정해야 합니다.

**API 키 생성 방법**:

**Windows PowerShell**:
```powershell
# 방법 1: Base64 인코딩 (권장)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# 방법 2: 16진수 문자열 (Node.js와 동일한 형식)
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# 방법 3: Node.js 사용 (가장 간단)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Windows CMD (명령 프롬프트)**:
```cmd
REM Node.js가 설치되어 있는 경우
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

REM OpenSSL이 설치되어 있는 경우
openssl rand -hex 32
```

**Linux/Mac**:
```bash
# OpenSSL을 사용한 랜덤 키 생성 (권장)
openssl rand -hex 32

# 또는 Node.js를 사용한 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**모든 플랫폼 (Node.js 설치 필요)**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**환경 변수 설정**:
```bash
# auth-server/.env 파일에 추가
ADMIN_API_KEY=생성된_랜덤_문자열
```

**보안 주의사항**:
- API 키는 절대 공개 저장소에 커밋하지 마세요
- 강력한 랜덤 문자열을 사용하세요 (최소 32자 이상)
- 프로덕션과 개발 환경은 다른 키를 사용하세요
- 정기적으로 키를 교체하는 것을 권장합니다

### 4. 구독 활성화 (이메일 기반)

**엔드포인트**: `POST /api/admin/subscriptions/activate`

**인증**: API Key 필요 (`x-api-key` 헤더 또는 `Authorization: Bearer {apiKey}`)

**요청 헤더**:
```
x-api-key: {ADMIN_API_KEY}
Content-Type: application/json
```

또는 Authorization 헤더 사용:
```
Authorization: Bearer {ADMIN_API_KEY}
Content-Type: application/json
```

**요청 본문**:
```json
{
  "email": "user@example.com",
  "serviceCode": "ppop-editor",
  "plan": "PRO",  // 선택사항, 기본값: "PRO" (NONE | BASIC | PRO)
  "expiresInDays": 30  // 선택사항, 만료일 (일 단위), 미입력시 무제한
}
```

**응답 (200)**:
```json
{
  "success": true,
  "message": "Subscription activated for user@example.com on ppop-editor",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**에러 응답 (404)**:
```json
{
  "success": false,
  "message": "User not found: user@example.com"
}
```

### 5. 구독 취소 (이메일 기반)

**엔드포인트**: `POST /api/admin/subscriptions/deactivate`

**인증**: API Key 필요 (`x-api-key` 헤더 또는 `Authorization: Bearer {apiKey}`)

**요청 본문**:
```json
{
  "email": "user@example.com",
  "serviceCode": "ppop-editor"
}
```

**응답 (200)**:
```json
{
  "success": true,
  "message": "Subscription cancelled for user@example.com on ppop-editor"
}
```

### 6. 서비스 생성 (관리자용)

**엔드포인트**: `POST /api/admin/services`

**인증**: API Key 필요 (`x-api-key` 헤더 또는 `Authorization: Bearer {apiKey}`)

**요청 본문**:
```json
{
  "code": "ppop-new-service",
  "name": "PPOP New Service",
  "description": "새로운 서비스 설명"
}
```

**응답 (201)**:
```json
{
  "success": true,
  "service": {
    "id": "uuid",
    "code": "ppop-new-service",
    "name": "PPOP New Service",
    "description": "새로운 서비스 설명",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 웹훅 연동

### Gumroad 웹훅

**엔드포인트**: `POST /api/webhooks/gumroad`

**설명**: Gumroad에서 결제 완료 시 자동으로 호출됩니다. `gumroadProductId`가 설정된 서비스에 대해 PRO 플랜을 자동 활성화합니다.

**요청 본문** (Gumroad 표준 형식):
```json
{
  "product_id": "gumroad-product-id",
  "email": "buyer@example.com",
  "sale_id": "sale-123",
  "sale_timestamp": "2024-01-01T00:00:00Z",
  "refunded": "false"
}
```

**환불 처리**: `refunded: "true"`인 경우 구독이 자동으로 취소됩니다.

### Latpeed 웹훅

**엔드포인트**: `POST /api/webhooks/latpeed?service={serviceCode}&plan={plan}`

**Query Parameters**:
- `service` (필수): 서비스 코드
- `plan` (선택): 기본 플랜 (기본값: PRO)

**요청 본문**:
```json
{
  "type": "NORMAL_PAYMENT" | "MEMBERSHIP_PAYMENT",
  "payment": {
    "email": "buyer@example.com",
    "status": "SUCCESS" | "CANCEL",
    "option": "basic" | "pro",  // 플랜 자동 감지
    "canceledReason": "환불 사유"  // 취소 시
  }
}
```

**플랜 감지**: `payment.option`에서 "basic" 또는 "pro"를 자동 감지합니다.

**멤버십 결제**: `type: "MEMBERSHIP_PAYMENT"`인 경우 30일 후 자동 만료됩니다.

## JWT 토큰 구조

### Access Token Payload
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "email": "user@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**주의**: JWT 토큰에는 구독 정보가 포함되지 않습니다. 구독 상태는 별도 API 호출로 확인해야 합니다.

## 연동 시나리오

### 시나리오 1: SaaS 서비스에서 사용자 권한 확인

1. 사용자가 SaaS 서비스에 로그인 (OAuth2 또는 JWT)
2. SaaS 서버에서 JWT 토큰 검증
3. 구독 상태 확인 API 호출:
   ```
   GET /api/subscriptions/{serviceCode}
   Authorization: Bearer {accessToken}
   ```
4. `hasAccess`가 `true`이고 `plan`이 "PRO"인 경우 프리미엄 기능 제공
5. `hasAccess`가 `true`이고 `plan`이 "BASIC"인 경우 기본 기능 제공
6. `hasAccess`가 `false`인 경우 제한된 기능 또는 업그레이드 유도

### 시나리오 2: 외부 결제 시스템 연동 (Make/Zapier)

1. 외부 결제 시스템에서 결제 완료 이벤트 발생
2. Make/Zapier 워크플로우에서 관리자 API 호출:
   ```
   POST /api/admin/subscriptions/activate
   x-api-key: {ADMIN_API_KEY}
   {
     "email": "buyer@example.com",
     "serviceCode": "ppop-editor",
     "plan": "PRO"
   }
   ```
3. 구독이 자동으로 활성화됨

### 시나리오 3: 웹훅 자동 연동

1. Gumroad 또는 Latpeed에서 결제 완료
2. 웹훅이 자동으로 호출되어 구독 활성화
3. 별도 API 호출 불필요

## 권한 확인 로직

```typescript
// 구독 상태 확인 응답 기반 권한 판단
function checkAccess(subscriptionStatus: SubscriptionStatusResponseDto): boolean {
  // 1. hasAccess가 true인지 확인
  if (!subscriptionStatus.hasAccess) {
    return false;
  }
  
  // 2. 상태가 ACTIVE인지 확인
  if (subscriptionStatus.status !== 'ACTIVE') {
    return false;
  }
  
  // 3. 만료일 확인 (있는 경우)
  if (subscriptionStatus.expiresAt) {
    const now = new Date();
    if (new Date(subscriptionStatus.expiresAt) < now) {
      return false; // 만료됨
    }
  }
  
  // 4. 플랜 확인
  if (subscriptionStatus.plan === 'NONE') {
    return false;
  }
  
  return true; // BASIC 또는 PRO면 접근 가능
}

// PRO 전용 기능 확인
function isProUser(subscriptionStatus: SubscriptionStatusResponseDto): boolean {
  return subscriptionStatus.hasAccess && 
         subscriptionStatus.status === 'ACTIVE' && 
         subscriptionStatus.plan === 'PRO';
}
```

## 주의사항

1. **JWT 토큰 검증**: 모든 API 호출 전에 JWT 토큰을 검증해야 합니다. 공개키는 `/.well-known/jwks.json`에서 가져올 수 있습니다.

2. **캐싱**: 구독 상태는 자주 변경되지 않으므로 적절한 캐싱 전략을 사용하는 것을 권장합니다 (예: 5-10분 TTL).

3. **에러 처리**: 
   - 401 Unauthorized: 토큰이 유효하지 않음 → 재로그인 유도
   - 404 Not Found: 서비스 코드가 존재하지 않음 → 관리자에게 문의
   - 네트워크 오류: 기본값으로 제한된 기능 제공 또는 재시도

4. **서비스 코드**: 각 SaaS 서비스는 고유한 `serviceCode`를 가져야 합니다. 서비스 등록은 관리자 API를 통해 수행합니다.

5. **만료일 처리**: `expiresAt`이 `null`이면 평생 라이센스입니다. `expiresAt`이 있는 경우 정기적으로 만료 여부를 확인해야 합니다.

6. **환불 처리**: Gumroad/Latpeed 웹훅을 통해 자동으로 처리되지만, 수동 환불의 경우 관리자 API를 사용하여 구독을 취소해야 합니다.

## 환경 변수

### Auth Server
- `ADMIN_API_KEY`: 관리자 API 키 (웹훅 및 관리자 API 인증용)
  - 생성 방법: `openssl rand -hex 32`
  - 최소 32자 이상의 강력한 랜덤 문자열 권장
  - 환경 변수로 설정: `ADMIN_API_KEY=your-generated-key-here`

### SaaS 서비스 (클라이언트)
- `AUTH_API_URL`: Auth 서버 Base URL
- `JWKS_URI`: JWT 공개키 URI (일반적으로 `{AUTH_API_URL}/.well-known/jwks.json`)

## 예제 코드

### Node.js/Express 예제

```typescript
import axios from 'axios';

const AUTH_API_URL = process.env.AUTH_API_URL;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY; // 관리자 API 키
const SERVICE_CODE = 'ppop-editor';

async function checkSubscription(accessToken: string) {
  try {
    const response = await axios.get(
      `${AUTH_API_URL}/api/subscriptions/${SERVICE_CODE}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw error;
  }
}

// 사용 예시
app.get('/api/premium-feature', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const subscription = await checkSubscription(token);
    
    if (!subscription.hasAccess || subscription.plan !== 'PRO') {
      return res.status(403).json({ 
        error: 'Premium subscription required' 
      });
    }
    
    // PRO 기능 제공
    res.json({ data: 'Premium feature data' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});
```

### 관리자 API 사용 예제 (Make/Zapier)

```typescript
// 구독 활성화 예제
async function activateSubscription(email: string, serviceCode: string, plan: 'BASIC' | 'PRO' = 'PRO') {
  const response = await axios.post(
    `${AUTH_API_URL}/api/admin/subscriptions/activate`,
    {
      email,
      serviceCode,
      plan,
      expiresInDays: 30 // 선택사항
    },
    {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// 구독 취소 예제
async function deactivateSubscription(email: string, serviceCode: string) {
  const response = await axios.post(
    `${AUTH_API_URL}/api/admin/subscriptions/deactivate`,
    {
      email,
      serviceCode
    },
    {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// 서비스 생성 예제
async function createService(code: string, name: string, description?: string) {
  const response = await axios.post(
    `${AUTH_API_URL}/api/admin/services`,
    {
      code,
      name,
      description
    },
    {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}
```

## 연동 체크리스트

- [ ] 서비스 코드 등록 (`POST /api/admin/services`)
- [ ] JWT 토큰 검증 로직 구현
- [ ] 구독 상태 확인 API 연동
- [ ] 권한 체크 미들웨어/가드 구현
- [ ] 에러 처리 및 폴백 로직 구현
- [ ] 캐싱 전략 수립
- [ ] 테스트 환경 구성
- [ ] 프로덕션 배포

## 문의 및 지원

추가 정보가 필요하거나 문제가 발생한 경우, 프로젝트 관리자에게 문의하세요.

