# 09. SaaS OAuth 연동 가이드

PPOP Auth와 연동하는 SaaS 서비스가 따라야 할 OAuth 연동 규칙입니다.

---

## 핵심 규칙 (필수)

### 로그인 버튼 클릭 시 → 항상 `prompt=login` 사용

```
GET /oauth/authorize
  ?client_id=ppop_auth_client
  &redirect_uri=https://your-app.com/auth/callback
  &response_type=code
  &state={random-state}
  &prompt=login
```

**이유:**
- 사용자가 로그인 버튼을 클릭하면 **항상 로그인 화면**을 보여줘야 함
- PPOP Auth 세션이 남아있어도 강제로 로그인 화면 표시
- 다른 계정으로 로그인하거나 쿠키 삭제 후에도 일관된 동작 보장

---

## 연동 코드 예시

### Next.js / React

```typescript
function LoginButton() {
  const handleLogin = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_PPOP_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      state,
      prompt: 'login',
    });

    window.location.href = `${process.env.NEXT_PUBLIC_PPOP_AUTH_URL}/oauth/authorize?${params}`;
  };

  return <button onClick={handleLogin}>로그인</button>;
}
```

### Callback 처리

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return Response.redirect('/login?error=' + error);
  }

  const savedState = cookies().get('oauth_state')?.value;
  if (state !== savedState) {
    return Response.redirect('/login?error=invalid_state');
  }

  const tokens = await exchangeCodeForTokens(code);
  
  return Response.redirect('/');
}
```

---

## 필수 체크리스트

| 항목 | 설명 |
|------|------|
| ✅ `prompt=login` 사용 | 로그인 버튼 클릭 시 필수 |
| ✅ `state` 파라미터 사용 | CSRF 방지용 랜덤 값 생성 및 검증 |
| ✅ `redirect_uri` 사전 등록 | [07_saas_registration.md](./07_saas_registration.md) 참고 |
| ✅ HTTPS 사용 | 프로덕션 환경에서 필수 |
| ✅ Authorization Code 즉시 교환 | 5분 내 토큰으로 교환 |

---

## 에러 처리

Callback으로 돌아올 때 에러가 발생할 수 있습니다:

| error 파라미터 | 의미 | 처리 방법 |
|----------------|------|----------|
| `invalid_request` | 잘못된 요청 파라미터 | client_id, redirect_uri 확인 |
| `login_required` | 세션 없음 (prompt=none 사용 시) | 로그인 화면으로 이동 |
| `unauthorized` | 인증 실패 | 다시 로그인 시도 |
| `server_error` | 서버 오류 | 재시도 또는 고객센터 안내 |

```typescript
const error = searchParams.get('error');
const errorDescription = searchParams.get('error_description');

if (error) {
  console.error(`OAuth Error: ${error} - ${errorDescription}`);
  return Response.redirect('/login?error=' + encodeURIComponent(errorDescription || error));
}
```

---

## 환경변수 설정

```env
PPOP_AUTH_CLIENT_ID=ppop_auth_client
PPOP_AUTH_CLIENT_SECRET=ppop_secret_xxxxxxxxxxxxxxxxxxxxx
PPOP_AUTH_API_URL=https://auth-server-production.up.railway.app
```

---

## 토큰 교환 API

```typescript
async function exchangeCodeForTokens(code: string) {
  const response = await fetch(`${process.env.PPOP_AUTH_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.PPOP_AUTH_CLIENT_ID,
      client_secret: process.env.PPOP_AUTH_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }),
  });

  return response.json();
}
```

---

## 관련 문서

- [05. API Specification](./05_api.md) - OAuth2 API 상세 설명
- [07. SaaS 등록 가이드](./07_saas_registration.md) - 새 SaaS 등록 방법

