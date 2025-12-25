# auth-server Dockerfile for Railway deployment
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm ci

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# NestJS 빌드
RUN npm run build

# Production 이미지
FROM node:20-alpine AS production

WORKDIR /app

# package.json 복사
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Production 의존성만 설치
RUN npm ci --omit=dev

# Prisma 클라이언트 생성 (runtime에 필요)
RUN npx prisma generate

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["node", "dist/main.js"]

