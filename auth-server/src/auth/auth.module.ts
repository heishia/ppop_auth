import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy, JwtStrategy, RefreshStrategy } from './strategies';
import { SocialAuthService, SocialAuthController } from './social';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}), // 동적으로 키를 로드하므로 빈 설정
  ],
  controllers: [AuthController, SocialAuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    SocialAuthService,
  ],
  exports: [AuthService, SocialAuthService],
})
export class AuthModule {}
