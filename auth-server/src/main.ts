import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  let corsOrigins: string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  
  if (corsOriginsEnv) {
    const origins = corsOriginsEnv.split(',').map(origin => origin.trim());
    
    // 와일드카드 패턴 지원 (예: https://*.vercel.app)
    corsOrigins = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, false);
        return;
      }
      
      // 정확히 일치하는 origin 확인
      if (origins.includes(origin)) {
        callback(null, true);
        return;
      }
      
      // 와일드카드 패턴 확인
      for (const allowedOrigin of origins) {
        if (allowedOrigin.includes('*')) {
          // 와일드카드를 정규식으로 변환
          const pattern = allowedOrigin.replace(/\*/g, '[^.]*').replace(/\./g, '\\.');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            callback(null, true);
            return;
          }
        }
      }
      
      callback(null, false);
    };
  } else {
    // 개발 환경 기본값
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CORS_ORIGINS environment variable is required in production');
    }
    corsOrigins = ['http://localhost:3001'];
  }
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // 서버 시작 (Railway는 PORT 환경변수 사용)
  const port = process.env.PORT || process.env.AUTH_SERVER_PORT || 3000;
  await app.listen(port);
  console.log(`Auth Server is running on port ${port}`);
}
void bootstrap();
