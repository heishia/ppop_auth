# auth-server Dockerfile for Railway deployment
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm install --include=dev

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# NestJS 빌드
RUN npm run build

# seed 스크립트 별도 컴파일 (nest build는 src/만 컴파일하므로)
RUN npx tsc prisma/seed.ts --outDir dist --esModuleInterop --module commonjs --moduleResolution node --target ES2023 --skipLibCheck

# Production 이미지
FROM node:22-alpine AS production

WORKDIR /app

# package.json 복사
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Production 의존성 설치 + prisma CLI (runtime migrate deploy에 필요)
RUN npm install --omit=dev && npm install prisma

# Prisma 클라이언트 생성 (runtime에 필요)
RUN npx prisma generate

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 노출
EXPOSE 3000

# 시작 스크립트 생성 (마이그레이션 + 시드 + 앱 시작)
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "[Start] Running Prisma migrations..."' >> /app/start.sh && \
    echo 'npx prisma migrate deploy || echo "[Start] WARNING: Migration failed, continuing anyway..."' >> /app/start.sh && \
    echo 'echo "[Start] Running seed (OAuth clients & services)..."' >> /app/start.sh && \
    echo 'node dist/prisma/seed.js || echo "[Start] WARNING: Seed failed, continuing anyway..."' >> /app/start.sh && \
    echo 'echo "[Start] Starting Node.js app..."' >> /app/start.sh && \
    echo 'exec node dist/src/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]

