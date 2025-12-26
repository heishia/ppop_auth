import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OAuthModule } from './oauth/oauth.module';
import { JwksModule } from './jwks/jwks.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 환경 변수 로드
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    OAuthModule,
    JwksModule,
    HealthModule,
  ],
})
export class AppModule {}
