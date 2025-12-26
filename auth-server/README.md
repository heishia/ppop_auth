# PPOP Auth Server

PPOP Cloud Auth Server - RS256 JWT 기반 인증 서버

## Features

- RS256 JWT 인증 (Access Token + Refresh Token Rotation)
- OAuth2 Authorization Code Grant
- SMS 인증 (네이버 클라우드 SMS)
- Rate Limiting 및 보안 강화
- 확장된 사용자 프로필 (이름, 생년월일, 전화번호)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

```bash
cp env.example .env
```

Edit `.env` file with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH`: RSA key paths
- `NAVER_SMS_*`: Naver Cloud SMS credentials (optional)

### 3. Generate RSA keys

```bash
cd ..
node scripts/generate-keys.js
```

### 4. Generate Prisma client and migrate

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Auth
- `POST /auth/register` - Basic registration
- `POST /auth/register/extended` - Extended registration (with profile)
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### SMS
- `POST /sms/send` - Send verification code
- `POST /sms/verify` - Verify code

### OAuth2
- `GET /oauth/authorize` - Authorization endpoint
- `POST /oauth/token` - Token endpoint

### JWKS
- `GET /.well-known/jwks.json` - Public keys

## Security Features

- Rate Limiting: 60 requests/minute (global)
- SMS Throttling: 1/min send, 5/10sec verify
- Password Policy: 6+ chars, letters + numbers + special chars
- Refresh Token Rotation with hash storage
- Brute Force Protection: 5 login attempts/minute
