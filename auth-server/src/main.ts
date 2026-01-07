import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[Bootstrap] Starting auth-server...');
  console.log('[Bootstrap] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Bootstrap] PORT:', process.env.PORT);

  let app;
  try {
    app = await NestFactory.create(AppModule);
    console.log('[Bootstrap] NestJS app created successfully');
  } catch (error) {
    console.error('[Bootstrap] Failed to create NestJS app:', error);
    process.exit(1);
  }

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성 있으면 에러
      transform: true, // 자동 타입 변환
    }),
  );

  // CORS 설정
  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const isProduction = process.env.NODE_ENV === 'production';

  // 개발 환경 기본 허용 Origin 목록
  const devDefaultOrigins = [
    'http://localhost:3001', // auth-client
    'http://localhost:3002', // ppop_link web
    'http://localhost:3003', // ppop_link web (alternate)
    'http://localhost:3004',
    'http://localhost:3005',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
  ];

  let corsOrigins:
    | string[]
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);

  // CORS 검증 함수
  const createCorsValidator = (allowedOrigins: string[]) => {
    return (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // origin이 없는 요청 허용 (서버-투-서버 요청, Postman 등)
      if (!origin) {
        callback(null, true);
        return;
      }

      // 정확히 일치하는 origin 확인
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // 와일드카드 패턴 확인 (예: https://*.vercel.app)
      for (const allowedOrigin of allowedOrigins) {
        if (allowedOrigin.includes('*')) {
          // 와일드카드를 정규식으로 변환
          const pattern = allowedOrigin
            .replace(/\*/g, '[^.]*')
            .replace(/\./g, '\\.');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            callback(null, true);
            return;
          }
        }
      }

      // 개발 환경에서 localhost 요청은 허용
      if (
        !isProduction &&
        (origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:'))
      ) {
        console.log(`[CORS] Allowing development origin: ${origin}`);
        callback(null, true);
        return;
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    };
  };

  if (corsOriginsEnv) {
    const origins = corsOriginsEnv.split(',').map((origin) => origin.trim());
    corsOrigins = createCorsValidator(origins);
  } else {
    // 프로덕션에서는 CORS_ORIGINS 필수
    if (isProduction) {
      throw new Error(
        'CORS_ORIGINS environment variable is required in production',
      );
    }
    // 개발 환경 기본값 사용
    corsOrigins = createCorsValidator(devDefaultOrigins);
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key'],
    exposedHeaders: ['Authorization', 'Location'],
  });

  const port = process.env.PORT || process.env.AUTH_SERVER_PORT || 3000;
  
  try {
    await app.listen(port);
    console.log(`[Bootstrap] Auth Server is running on port ${port}`);
  } catch (error) {
    console.error('[Bootstrap] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('[Bootstrap] Unhandled error:', error);
  process.exit(1);
});
