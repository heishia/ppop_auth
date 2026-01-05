# 07. SaaS 등록 가이드

새로운 SaaS 서비스를 PPOP Auth에 등록하는 방법을 단계별로 안내합니다.

---

## 개요

새로운 SaaS를 등록하려면 다음 3가지 설정이 필요합니다:

1. **OAuth Redirect URI 등록** (데이터베이스)
2. **CORS 설정** (Auth Server 환경변수)
3. **Client Secret 전달** (SaaS 프로젝트 환경변수)

---

## 사전 준비

새 SaaS를 등록하기 전에 다음 정보를 준비하세요:

- **SaaS 도메인**: 예) `https://new-saas.com`
- **Callback 경로**: 예) `/auth/callback`
- **전체 Redirect URI**: 예) `https://new-saas.com/auth/callback`

---

## 단계별 등록 절차

### 1단계: Redirect URI 등록 (데이터베이스)

**파일:** `auth-server/prisma/seed.ts`

**작업:**
1. `seed.ts` 파일을 엽니다
2. `redirectUris` 배열에 새 SaaS의 redirect URI를 추가합니다

**예시:**
```typescript
redirectUris: [
  'http://localhost:3000/auth/callback',
  'https://ppoplink.site/auth/callback',
  'https://new-saas.com/auth/callback',  // 새 SaaS 추가
  'http://localhost:3002/auth/callback',
  'http://localhost:3002/api/auth/callback',
],
```

**주의사항:**
- 프로토콜(`https://` 또는 `http://`)을 정확히 입력하세요
- 도메인과 경로가 정확히 일치해야 합니다 (대소문자 구분)
- 슬래시(`/`) 위치를 확인하세요

---

### 2단계: Seed 실행 (데이터베이스 업데이트)

**명령어:**
```bash
cd auth-server
npx ts-node prisma/seed.ts
```

**또는 루트에서:**
```bash
npm run db:seed
```

**결과 확인:**
- 콘솔에 생성된 OAuth 클라이언트 정보가 출력됩니다
- **Client Secret**을 복사해두세요 (3단계에서 필요)

**예시 출력:**
```
Created OAuth client:
  Client ID: ppop_auth_client
  Client Secret: ppop_secret_xxxxxxxxxxxxxxxxxxxxx
  Name: PPOP Auth Client
  Redirect URIs: http://localhost:3000/auth/callback, https://ppoplink.site/auth/callback, https://new-saas.com/auth/callback, ...
```

---

### 3단계: CORS 설정 (Auth Server 환경변수)

**위치:** Railway 또는 배포 환경의 Auth Server 환경변수 설정

**환경변수:** `CORS_ORIGINS`

**작업:**
1. Railway Dashboard에서 Auth Server의 Variables 탭으로 이동
2. `CORS_ORIGINS` 환경변수를 찾습니다
3. 새 SaaS 도메인을 쉼표로 구분하여 추가합니다

**형식:**
```
기존도메인1,기존도메인2,새SaaS도메인
```

**예시 (변경 전):**
```
https://auth-client-production-04b4.up.railway.app,https://ppoplink.site
```

**예시 (변경 후):**
```
https://auth-client-production-04b4.up.railway.app,https://ppoplink.site,https://new-saas.com
```

**주의사항:**
- 프로토콜(`https://`)을 포함해야 합니다
- 쉼표 뒤에 공백 없이 입력하거나, 공백을 포함해도 됩니다 (코드에서 trim 처리)
- 서브도메인도 별도로 추가해야 합니다 (예: `www.new-saas.com`)

**서버 재시작:**
- 환경변수 변경 후 Auth Server가 자동으로 재시작됩니다
- 또는 수동으로 재배포하세요

---

### 4단계: Client Secret 전달 (SaaS 프로젝트)

**위치:** 새 SaaS 프로젝트의 환경변수 설정

**환경변수:** `PPOP_AUTH_CLIENT_SECRET` (또는 프로젝트에서 사용하는 변수명)

**작업:**
1. 2단계에서 복사한 **Client Secret**을 사용합니다
2. SaaS 프로젝트의 환경변수에 추가합니다

**예시:**
```env
PPOP_AUTH_CLIENT_SECRET=ppop_secret_xxxxxxxxxxxxxxxxxxxxx
PPOP_AUTH_CLIENT_ID=ppop_auth_client
PPOP_AUTH_API_URL=https://auth-server-production-57c0.up.railway.app
```

**주의사항:**
- Client Secret은 절대 공개 저장소에 커밋하지 마세요
- 환경변수로만 관리하세요
- Client Secret이 변경되면 모든 SaaS 프로젝트의 환경변수를 업데이트해야 합니다

---

## 전체 등록 체크리스트

새 SaaS 등록 시 다음 항목을 확인하세요:

- [ ] `auth-server/prisma/seed.ts`에 redirect URI 추가
- [ ] Seed 실행 완료 (`npm run db:seed`)
- [ ] Client Secret 복사 및 저장
- [ ] Auth Server의 `CORS_ORIGINS`에 새 도메인 추가
- [ ] SaaS 프로젝트에 `PPOP_AUTH_CLIENT_SECRET` 환경변수 설정
- [ ] SaaS 프로젝트에 `PPOP_AUTH_CLIENT_ID` 환경변수 설정 (보통 `ppop_auth_client`)
- [ ] SaaS 프로젝트에 `PPOP_AUTH_API_URL` 환경변수 설정
- [ ] 프로덕션에서 OAuth 로그인 테스트

---

## 여러 SaaS 등록 예시

여러 SaaS를 한 번에 등록하는 경우:

**1. seed.ts 수정:**
```typescript
redirectUris: [
  'http://localhost:3000/auth/callback',
  'https://ppoplink.site/auth/callback',
  'https://saas1.com/auth/callback',      // SaaS 1
  'https://saas2.com/auth/callback',      // SaaS 2
  'https://saas3.com/auth/callback',      // SaaS 3
  'http://localhost:3002/auth/callback',
],
```

**2. CORS_ORIGINS 설정:**
```
https://auth-client-production-04b4.up.railway.app,https://ppoplink.site,https://saas1.com,https://saas2.com,https://saas3.com
```

**3. Seed 실행:**
```bash
npm run db:seed
```

**4. 각 SaaS 프로젝트에 동일한 Client Secret 설정**

---

## 문제 해결

### "Invalid redirect_uri" 에러

**원인:**
- 데이터베이스에 등록된 redirect URI와 요청한 redirect URI가 일치하지 않음

**해결:**
1. SaaS에서 보내는 `redirect_uri` 파라미터 확인
2. `seed.ts`의 `redirectUris` 배열과 정확히 일치하는지 확인
3. 프로토콜, 도메인, 경로가 모두 일치해야 함
4. Seed 재실행

### CORS 에러

**원인:**
- `CORS_ORIGINS`에 SaaS 도메인이 포함되지 않음

**해결:**
1. Auth Server의 `CORS_ORIGINS` 환경변수 확인
2. 새 SaaS 도메인 추가
3. 서버 재시작

### "Invalid client_id" 에러

**원인:**
- Client ID가 잘못되었거나 존재하지 않음

**해결:**
1. Client ID가 `ppop_auth_client`인지 확인
2. SaaS 프로젝트의 환경변수 확인

### "Invalid client_secret" 에러

**원인:**
- Client Secret이 잘못되었거나 만료됨

**해결:**
1. Seed를 다시 실행하여 새 Client Secret 생성
2. 모든 SaaS 프로젝트의 환경변수 업데이트

---

## 주의사항

### Client Secret 관리

- **중요:** Client Secret은 모든 SaaS가 공유합니다
- Seed를 실행하면 기존 Client Secret이 삭제되고 새로 생성됩니다
- Seed 실행 후에는 **모든 SaaS 프로젝트**의 환경변수를 업데이트해야 합니다

### Redirect URI 정확성

- Redirect URI는 **정확히 일치**해야 합니다
- 다음은 모두 다른 URI로 인식됩니다:
  - `https://example.com/auth/callback`
  - `https://example.com/auth/callback/` (끝에 슬래시)
  - `https://www.example.com/auth/callback` (www 포함)
  - `http://example.com/auth/callback` (http vs https)

### 프로덕션 배포

- Seed 실행 후 프로덕션 데이터베이스에 반영되었는지 확인
- Railway 등에서 직접 데이터베이스에 접근하여 확인 가능
- 또는 프로덕션에서 직접 seed 실행

---

## 빠른 참조

### 새 SaaS 등록 명령어 요약

```bash
# 1. seed.ts 파일 수정 (redirectUris 배열에 추가)

# 2. Seed 실행
cd auth-server
npx ts-node prisma/seed.ts

# 3. Client Secret 복사 (출력된 값)

# 4. Railway에서 CORS_ORIGINS 환경변수 수정

# 5. SaaS 프로젝트에 환경변수 설정
```

### 필수 환경변수 (SaaS 프로젝트)

```env
PPOP_AUTH_CLIENT_ID=ppop_auth_client
PPOP_AUTH_CLIENT_SECRET=ppop_secret_xxxxxxxxxxxxxxxxxxxxx
PPOP_AUTH_API_URL=https://auth-server-production-57c0.up.railway.app
```

---

## 관련 문서

- [05. API Specification](./05_api.md) - OAuth2 API 상세 설명
- [06. Development Guide](./06_dev_guide.md) - 개발 환경 설정
- [09. SaaS 연동 가이드](./09_saas_integration.md) - OAuth 연동 규칙 (prompt 파라미터 등)

