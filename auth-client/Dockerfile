# auth-client Dockerfile for Railway deployment
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 모든 의존성 설치 (devDependencies 포함 - TypeScript, Tailwind 등)
RUN npm install --include=dev

# 소스 코드 복사
COPY . .

# 빌드 타임 환경변수 (Railway에서 자동으로 전달됨)
# NEXT_PUBLIC_* 환경변수는 빌드 타임에 주입되어야 함
ARG NEXT_PUBLIC_AUTH_API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL

# Next.js 빌드 (standalone 모드)
RUN npm run build

# Production 이미지
FROM node:22-alpine AS production

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

