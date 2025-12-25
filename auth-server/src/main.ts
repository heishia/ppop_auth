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
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // 서버 시작 (Railway는 PORT 환경변수 사용)
  const port = process.env.PORT || process.env.AUTH_SERVER_PORT || 3000;
  await app.listen(port);
  console.log(`Auth Server is running on port ${port}`);
}
bootstrap();
