import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OAuthModule } from './oauth/oauth.module';
import { JwksModule } from './jwks/jwks.module';
import { HealthModule } from './health/health.module';
import { SmsModule } from './sms/sms.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    // 환경 변수 로드
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    // Rate Limiting 설정 (분당 60개 요청)
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1분
          limit: 60, // 분당 60개 요청
        },
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    OAuthModule,
    JwksModule,
    HealthModule,
    SmsModule,
    SubscriptionModule,
  ],
  providers: [
    // 전역 Rate Limiting 가드 적용
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
