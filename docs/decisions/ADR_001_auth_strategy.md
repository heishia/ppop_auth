# ADR-001: 인증 전략 선택

## Status

**Accepted** - 2024년

---

## Context

PPOP Auth는 여러 SaaS 서비스를 운영할 플랫폼입니다. 각 SaaS에서 개별적으로 인증을 구현할 것인지, 중앙 집중식 인증 서버를 둘 것인지 결정이 필요했습니다.

### 고려 사항

1. **SaaS 확장성**: 서비스 추가 시 인증 로직 재구현 비용
2. **SSO (Single Sign-On)**: 하나의 계정으로 여러 서비스 이용
3. **보안**: 인증 로직의 중앙 관리 및 업데이트
4. **개발 효율성**: 중복 코드 최소화
5. **결제 연동**: 통합 계정과 SaaS별 결제

---

## Decision

### 1. 중앙 집중식 Auth 서버 도입

**선택:** 별도의 Auth 서버를 두고, 모든 SaaS는 이 서버에 인증을 위임

```
[Auth Server] ──> [SaaS A] [SaaS B] [SaaS C]
```

**이유:**
- SaaS 추가 시 인증 로직 재구현 불필요
- SSO 자연스럽게 지원
- 보안 업데이트 한 곳에서 관리

---

### 2. 기술 스택: NestJS (Node.js)

**선택:** NestJS + TypeScript

**비교:**
| 옵션 | 장점 | 단점 |
|------|------|------|
| **NestJS** | Auth 생태계 최강 (Passport.js), OAuth2 Provider 라이브러리 성숙 | - |
| FastAPI | Python 익숙, 개발 속도 | Auth 특화 라이브러리 부족 |
| Go | 성능 최고 | 개발 속도 느림, Auth 라이브러리 미성숙 |

**결정 이유:**
1. Passport.js로 소셜 로그인 쉽게 확장
2. oidc-provider로 OAuth2 Provider 구현 용이
3. 프론트엔드(Next.js)와 언어 통일로 타입 공유

---

### 3. 인증 프로토콜: OAuth2 + JWT

**선택:** Authorization Code Flow + JWT (RS256)

```
SaaS ──> Auth Server (/authorize)
         ──> 로그인
         ──> code 발급
SaaS Server ──> Auth Server (/token)
             ──> code 교환
             ──> JWT 발급
```

**이유:**
- **Authorization Code**: 토큰이 URL에 노출되지 않음 (보안)
- **JWT**: Stateless, SaaS가 자체 검증 가능
- **RS256**: 공개키로 검증, 비밀키는 Auth 서버만 보유

**기각된 옵션:**
- ~~Implicit Flow~~: 토큰 URL 노출, 보안 취약
- ~~Session-based~~: 상태 관리 복잡, 수평 확장 어려움
- ~~HS256~~: 모든 서버가 비밀키 공유해야 함

---

### 4. 결제 분리

**선택:** Auth와 Billing 완전 분리

```
Auth Server: user_id 발급만
SaaS: user_id 기반 결제 처리
```

**이유:**
- Auth 서버 책임 범위 최소화
- SaaS별 다른 결제 정책 가능
- Stripe Webhook을 각 SaaS가 직접 처리

**기각된 옵션:**
- ~~Auth + Billing 통합~~: 책임 범위 비대화, 결합도 높음

---

### 5. 데이터베이스: Supabase

**선택:** Supabase (PostgreSQL)

**이유:**
- 관리형 PostgreSQL
- Row Level Security 지원
- 관리 UI 제공
- Railway와 연동 용이

**Supabase Auth 사용 안함:**
- 커스터마이징 제한
- OAuth2 Provider 기능 없음
- 우리 요구사항과 맞지 않음

---

## Consequences

### 장점

1. **확장성**: SaaS 추가 시 Auth 서버 수정 불필요
2. **SSO**: 자연스럽게 지원
3. **보안**: 중앙 관리, 일관된 정책
4. **개발 효율**: 인증 로직 중복 제거

### 단점

1. **Single Point of Failure**: Auth 서버 장애 시 전체 영향
   - 대응: 다중 인스턴스, 헬스체크
2. **네트워크 지연**: 모든 인증이 Auth 서버 경유
   - 대응: JWT 자체 검증으로 최소화
3. **복잡성**: OAuth2 구현 초기 비용
   - 대응: 검증된 라이브러리 사용

### 리스크 완화

| 리스크 | 완화 전략 |
|--------|----------|
| Auth 서버 장애 | Railway 다중 인스턴스 |
| 토큰 탈취 | 짧은 Access Token (15분), Refresh Token DB 관리 |
| Key 유출 | 환경변수 관리, 정기 로테이션 |

---

## Alternatives Considered

### 1. Supabase Auth 직접 사용

**기각 이유:**
- OAuth2 Provider 기능 없음
- SaaS별 세션 관리 어려움
- 커스터마이징 제한

### 2. Auth0 / Clerk 사용

**기각 이유:**
- 비용 (사용자 수 기반 과금)
- 종속성 (Vendor Lock-in)
- 학습 목적에 맞지 않음

### 3. 각 SaaS가 독립 인증

**기각 이유:**
- SSO 불가
- 중복 구현
- 보안 일관성 없음

---

## References

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)

---

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| 2024-XX-XX | - | Initial decision |

