# auth-client Dockerfile for Railway deployment
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 모든 의존성 설치 (devDependencies 포함 - TypeScript, Tailwind 등)
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 빌드 (standalone 모드)
RUN npm run build

# Production 이미지
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# standalone 서버에 필요한 파일들 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["node", "server.js"]

