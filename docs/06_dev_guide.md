# 06. Development Guide

## 개발 환경 설정

### 필수 요구사항

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Git | 2.x |
| Docker | (선택) |

---

## 프로젝트 초기 설정

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/ppop-auth.git
cd ppop-auth
```

### 2. Auth Server 설정

```bash
cd auth-server
npm install

# 환경변수 설정
cp .env.example .env
```

**.env 파일:**
```env
# App
NODE_ENV=development
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# (RS256 사용 시)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL
AUTH_CLIENT_URL=http://localhost:3001
```

### 3. RSA 키 생성 (RS256용)

```bash
mkdir keys
cd keys

# 비밀키 생성
openssl genrsa -out private.pem 2048

# 공개키 추출
openssl rsa -in private.pem -pubout -out public.pem
```

### 4. DB 마이그레이션

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run start:dev
```

---

## Auth Client 설정

```bash
cd auth-client
npm install

cp .env.example .env.local
```

**.env.local:**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3000
```

```bash
npm run dev
```

---

## 프로젝트 구조

```
ppop-auth/
├── auth-server/              # NestJS Auth Server
│   ├── src/
│   │   ├── auth/
│   │   ├── oauth/
│   │   ├── users/
│   │   ├── social/
│   │   └── common/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── keys/                 # RSA 키 (gitignore)
│   ├── test/
│   ├── .env
│   └── package.json
│
├── auth-client/              # Next.js Login UI
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── packages/                 # 공유 패키지
│   └── auth-sdk/             # JWT 검증 SDK
│
├── saas-ppop/               # 첫 번째 SaaS
│   ├── backend/
│   └── frontend/
│
└── docs/
```

---

## 코딩 컨벤션

### 파일 네이밍

```
// 모듈
auth.module.ts

// 컨트롤러
auth.controller.ts

// 서비스
auth.service.ts

// DTO
create-user.dto.ts

// 가드
jwt-auth.guard.ts

// 전략
jwt.strategy.ts
```

### 코드 스타일

```typescript
// 인터페이스
interface JwtPayload {
  sub: string;
  email: string;
}

// 클래스
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    // 구현
  }
}
```

### Import 순서

```typescript
// 1. Node.js 내장 모듈
import { randomBytes } from 'crypto';

// 2. 외부 라이브러리
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// 3. 내부 모듈 (절대 경로)
import { UsersService } from '@/users/users.service';

// 4. 상대 경로
import { LoginDto } from './dto/login.dto';
```

---

## Git 워크플로우

### 브랜치 전략

```
main          # 프로덕션
├── develop   # 개발 통합
├── feature/* # 기능 개발
├── fix/*     # 버그 수정
└── release/* # 릴리즈 준비
```

### 커밋 메시지

```
feat: 회원가입 기능 추가
fix: JWT 만료 시간 버그 수정
docs: API 문서 업데이트
refactor: AuthService 리팩토링
test: 로그인 테스트 추가
chore: 의존성 업데이트
```

---

## 테스트

### 단위 테스트

```bash
npm run test
```

### E2E 테스트

```bash
npm run test:e2e
```

### 테스트 커버리지

```bash
npm run test:cov
```

### 테스트 파일 구조

```
src/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts    # 단위 테스트

test/
└── auth.e2e-spec.ts            # E2E 테스트
```

---

## 배포

### Railway 배포

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 배포
railway up
```

### 환경변수 설정

Railway Dashboard에서:
1. Variables 탭
2. 필요한 환경변수 추가

### 도메인 설정

1. Settings > Domains
2. Custom Domain 추가
3. DNS 설정 (CNAME)

---

## 디버깅

### VS Code 설정

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "port": 9229
    }
  ]
}
```

### 로깅

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(dto: LoginDto) {
    this.logger.log(`Login attempt: ${dto.email}`);
    // ...
    this.logger.error(`Login failed: ${dto.email}`, error.stack);
  }
}
```

---

## 유용한 명령어

```bash
# Prisma
npx prisma studio          # DB GUI
npx prisma migrate dev     # 마이그레이션 생성
npx prisma db push         # 스키마 동기화 (개발용)
npx prisma generate        # 클라이언트 생성

# NestJS
nest g module auth         # 모듈 생성
nest g controller auth     # 컨트롤러 생성
nest g service auth        # 서비스 생성

# 빌드
npm run build              # 프로덕션 빌드
npm run start:prod         # 프로덕션 실행
```

---

## 문제 해결

### Port 충돌

```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

### Prisma 연결 오류

```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# 연결 테스트
npx prisma db pull
```

### JWT 검증 실패

1. 토큰 만료 확인
2. 키 파일 경로 확인
3. 알고리즘 일치 확인 (RS256)

---

## 관련 문서

- [Architecture](04_architecture.md) - 시스템 구조
- [API](05_api.md) - API 명세

