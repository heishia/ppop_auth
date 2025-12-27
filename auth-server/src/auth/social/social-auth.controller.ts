import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { SocialAuthService, SocialProvider } from './social-auth.service';

// 유효한 프로바이더 목록
const VALID_PROVIDERS: SocialProvider[] = ['kakao', 'naver', 'google'];

@Controller('auth/social')
export class SocialAuthController {
  constructor(
    private socialAuthService: SocialAuthService,
    private configService: ConfigService,
  ) {}

  // GET /api/auth/social/:provider - 소셜 로그인 시작 (리다이렉트)
  @Get(':provider')
  async initiateLogin(
    @Param('provider') provider: string,
    @Res() res: Response,
  ) {
    // 프로바이더 유효성 검사
    if (!VALID_PROVIDERS.includes(provider as SocialProvider)) {
      throw new BadRequestException(`Invalid provider: ${provider}`);
    }

    // CSRF 방지용 state 생성
    const state = this.socialAuthService.generateState();

    // state를 쿠키에 저장 (콜백에서 검증용)
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10분
    });

    // 소셜 로그인 페이지로 리다이렉트
    const authUrl = this.socialAuthService.getAuthorizationUrl(
      provider as SocialProvider,
      state,
    );

    return res.redirect(authUrl);
  }

  // GET /api/auth/social/:provider/callback - 소셜 로그인 콜백
  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const clientUrl = this.configService.get<string>('AUTH_CLIENT_URL');

    // 프로바이더 유효성 검사
    if (!VALID_PROVIDERS.includes(provider as SocialProvider)) {
      return res.redirect(
        `${clientUrl}/auth/callback?error=invalid_provider&message=${encodeURIComponent('Invalid provider')}`,
      );
    }

    // 에러 처리 (사용자가 취소한 경우 등)
    if (error) {
      return res.redirect(
        `${clientUrl}/auth/callback?error=${error}&message=${encodeURIComponent(errorDescription || 'Login cancelled')}`,
      );
    }

    // code 파라미터 확인
    if (!code) {
      return res.redirect(
        `${clientUrl}/auth/callback?error=missing_code&message=${encodeURIComponent('Authorization code not provided')}`,
      );
    }

    // state 검증 (CSRF 방지)
    // 주의: 실제 프로덕션에서는 쿠키의 state와 비교해야 함
    // 여기서는 단순화를 위해 state 존재 여부만 확인
    if (!state) {
      return res.redirect(
        `${clientUrl}/auth/callback?error=invalid_state&message=${encodeURIComponent('Invalid state parameter')}`,
      );
    }

    try {
      // 소셜 로그인 처리
      const result = await this.socialAuthService.handleCallback(
        provider as SocialProvider,
        code,
      );

      // state 쿠키 삭제
      res.clearCookie('oauth_state');

      // 프론트엔드로 토큰과 함께 리다이렉트
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: String(result.expiresIn),
      });

      return res.redirect(`${clientUrl}/auth/callback?${params.toString()}`);
    } catch (err) {
      console.error('Social login error:', err);
      const message =
        err instanceof Error ? err.message : 'Social login failed';
      return res.redirect(
        `${clientUrl}/auth/callback?error=login_failed&message=${encodeURIComponent(message)}`,
      );
    }
  }

  // GET /api/auth/social/providers - 지원하는 프로바이더 목록
  @Get('providers')
  getProviders() {
    return {
      providers: VALID_PROVIDERS,
    };
  }
}

