# 00. Project Overview

## 프로젝트 개요

PPOP Auth는 **통합 인증 서버**를 중심으로 여러 SaaS 서비스에 인증을 제공하는 플랫폼입니다.

### 핵심 목표

1. **Single Sign-On (SSO)**: 하나의 계정으로 모든 SaaS 이용
2. **중앙 집중 인증**: Auth 서버가 유일한 인증 주체
3. **독립적 Billing**: 각 SaaS가 자체 결제 관리
4. **확장 가능한 구조**: SaaS 추가 시 Auth 서버 수정 불필요

---

## 시스템 구성

```
+---------------------------------------------------------------------+
|                    auth.yourdomain.com                               |
|  +---------------------------------------------------------------+  |
|  |              Auth Server (NestJS)                             |  |
|  |  - 회원가입 / 로그인                                           |  |
|  |  - JWT 발급 / 갱신                                             |  |
|  |  - OAuth2 Provider                                            |  |
|  |  - 소셜 로그인 (Google, GitHub, Kakao) [P1]                   |  |
|  +---------------------------------------------------------------+  |
|                           |                                          |
|                    Supabase (PostgreSQL)                             |
|                 users, refresh_tokens, oauth_clients                 |
+---------------------------------------------------------------------+
                            |
                            | JWT (user_id 포함)
                            v
         +------------------+------------------+
         v                  v                  v
   +----------+       +----------+       +----------+
   |  SaaS A  |       |  SaaS B  |       |  SaaS C  |
   | (별도 repo)       | (future) |       | (future) |
   +----------+       +----------+       +----------+
        |
        | npm install @ppop/auth-sdk
        v
   +----------+
   | Auth SDK |
   +----------+
```

---

## 핵심 원칙

### 1. Auth 서버의 책임

| 책임 | 설명 |
|------|------|
| 회원 관리 | 가입, 탈퇴, 계정 상태 |
| 인증 | 로그인, 비밀번호 검증 |
| 토큰 발급 | JWT Access/Refresh Token |
| OAuth2 Provider | SaaS에 인증 위임 |

### 2. Auth 서버가 하지 않는 것

| 비책임 | 이유 |
|--------|------|
| 결제 처리 | Billing은 각 SaaS 담당 |
| 권한 관리 | SaaS별 권한은 SaaS가 관리 |
| 비즈니스 로직 | SaaS 고유 기능 |

### 3. SaaS의 책임

- JWT 검증 (Auth SDK 또는 JWKS 사용)
- 자체 비즈니스 로직
- 결제/구독 관리
- user_id 기반 데이터 관리

---

## 기술 스택

| Component | Technology | 선택 이유 |
|-----------|------------|----------|
| Auth Server | NestJS + TypeScript | Auth 생태계 최강 (Passport.js) |
| Auth Client | Next.js + Tailwind | 빠른 개발, 모던 UI |
| Auth SDK | TypeScript + jose | JWT 검증 표준 라이브러리 |
| Database | Supabase (PostgreSQL) | 관리형 DB + Row Level Security |
| Deploy | Railway | 간편한 배포 + 스케일링 |
| Auth Protocol | OAuth2 + JWT | 산업 표준 |

---

## 용어 정의

| 용어 | 정의 |
|------|------|
| Auth Server | 중앙 인증 서버. 로그인/토큰 발급 담당 |
| Auth Client | 공통 로그인 UI (auth.domain.com) |
| Auth SDK | SaaS에서 JWT 검증용 npm 패키지 |
| SaaS | Auth Server에 인증을 위임하는 개별 서비스 |
| OAuth Client | Auth Server에 등록된 SaaS 애플리케이션 |
| JWT | JSON Web Token. 사용자 인증 정보 담은 토큰 |
| user_id | Auth Server가 발급하는 사용자 고유 식별자 (UUID) |

---

## 프로젝트 구조

```
ppop_auth/
+-- auth-server/          # 중앙 인증 서버 (NestJS)
|   +-- src/
|   |   +-- auth/         # 인증 모듈
|   |   +-- oauth/        # OAuth2 Provider
|   |   +-- users/        # 사용자 관리
|   |   +-- jwks/         # JWKS 엔드포인트
|   |   +-- prisma/       # DB 서비스
|   +-- prisma/           # DB 스키마
|
+-- auth-client/          # 공통 로그인 UI (Next.js)
|   +-- app/
|   |   +-- login/
|   |   +-- register/
|   |   +-- oauth/
|   +-- components/
|   +-- lib/
|
+-- packages/
|   +-- auth-sdk/         # JWT 검증 SDK (npm 패키지)
|       +-- src/
|
+-- docs/                 # 문서
+-- keys/                 # RSA 키 (gitignored)
+-- scripts/              # 유틸리티 스크립트
```

---

## 관련 문서

- [Requirements](01_requirements.md) - 기능 요구사항
- [Architecture](04_architecture.md) - 상세 아키텍처
- [API](05_api.md) - API 명세
