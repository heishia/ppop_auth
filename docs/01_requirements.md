# 01. Requirements

## 기능 요구사항

### Auth Server

#### 1. 회원 관리 (Users)

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| U-01 | 회원가입 | P0 | 이메일 + 비밀번호 |
| U-02 | 이메일 인증 | P1 | 가입 후 이메일 확인 |
| U-03 | 비밀번호 재설정 | P1 | 이메일로 재설정 링크 |
| U-04 | 회원 탈퇴 | P2 | 계정 삭제 또는 비활성화 |
| U-05 | 계정 상태 관리 | P1 | active, banned, pending |

#### 2. 인증 (Authentication)

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| A-01 | 로그인 | P0 | 이메일 + 비밀번호 |
| A-02 | JWT 발급 | P0 | Access Token (15분) |
| A-03 | Refresh Token | P0 | Refresh Token (7일) |
| A-04 | 토큰 갱신 | P0 | Refresh로 Access 재발급 |
| A-05 | 로그아웃 | P0 | Refresh Token 무효화 |
| A-06 | 다중 디바이스 | P2 | 디바이스별 세션 관리 |

#### 3. OAuth2 Provider

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| O-01 | Authorization Code Flow | P0 | SaaS 인증 위임 |
| O-02 | Token Exchange | P0 | code -> token 교환 |
| O-03 | Client 등록 | P0 | SaaS 앱 등록 |
| O-04 | Redirect URI 검증 | P0 | 보안 |

#### 4. 소셜 로그인

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| S-01 | Google 로그인 | P1 | OAuth2 |
| S-02 | GitHub 로그인 | P2 | OAuth2 |
| S-03 | Kakao 로그인 | P2 | OAuth2 |
| S-04 | 계정 연동 | P2 | 기존 계정에 소셜 추가 |

---

### Auth Client (공통 로그인 UI)

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| C-01 | 로그인 페이지 | P0 | auth.domain.com/login |
| C-02 | 회원가입 페이지 | P0 | auth.domain.com/register |
| C-03 | 비밀번호 재설정 | P1 | auth.domain.com/reset-password |
| C-04 | OAuth 동의 화면 | P1 | SaaS 접근 권한 동의 |
| C-05 | 반응형 디자인 | P0 | 모바일 지원 |

---

### SaaS (ppop)

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| P-01 | JWT 검증 | P0 | Auth 서버 공개키로 검증 |
| P-02 | 구독 관리 | P1 | Stripe 연동 |
| P-03 | 결제 처리 | P1 | Stripe Checkout |
| P-04 | Webhook 수신 | P1 | 결제 상태 업데이트 |

---

## 비기능 요구사항

### 성능

| 항목 | 목표 |
|------|------|
| 로그인 응답 시간 | < 500ms |
| 동시 접속자 | 1,000명 |
| 가용성 | 99.9% |

### 보안

| 항목 | 요구사항 |
|------|----------|
| 비밀번호 | bcrypt (cost 12) |
| JWT 알고리즘 | RS256 |
| HTTPS | 필수 |
| Rate Limiting | 로그인 5회/분 |
| CORS | 허용 origin만 |

### 확장성

| 항목 | 요구사항 |
|------|----------|
| SaaS 추가 | Auth 서버 수정 없이 가능 |
| 수평 확장 | Stateless 설계 |

---

## 우선순위 정의

| 등급 | 의미 | 일정 |
|------|------|------|
| P0 | MVP 필수 | 1차 출시 |
| P1 | 중요 | 2차 출시 |
| P2 | 선택 | 추후 |

---

## 관련 문서

- [Use Cases](03_usecases.md) - 상세 유스케이스
- [API](05_api.md) - API 명세

