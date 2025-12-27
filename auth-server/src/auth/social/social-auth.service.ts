import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { loadPrivateKey } from '../../common/key-loader';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// 소셜 프로바이더 타입
export type SocialProvider = 'kakao' | 'naver' | 'google';

// 소셜 사용자 정보 인터페이스
interface SocialUserInfo {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  name?: string;
}

// 토큰 응답 인터페이스
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class SocialAuthService {
  private privateKey: string;
  private accessExpiresIn: number;
  private refreshExpiresIn: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.privateKey = loadPrivateKey();

    const accessExpStr =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.accessExpiresIn = this.parseExpiresIn(accessExpStr);
    this.refreshExpiresIn = this.parseExpiresIn(refreshExpStr);
  }

  // 소셜 로그인 인가 URL 생성
  getAuthorizationUrl(provider: SocialProvider, state: string): string {
    const serverUrl = this.configService.get<string>('AUTH_SERVER_URL');
    const redirectUri = `${serverUrl}/api/auth/social/${provider}/callback`;

    switch (provider) {
      case 'kakao':
        return this.getKakaoAuthUrl(redirectUri, state);
      case 'naver':
        return this.getNaverAuthUrl(redirectUri, state);
      case 'google':
        return this.getGoogleAuthUrl(redirectUri, state);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  // 카카오 인가 URL
  private getKakaoAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });
    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  // 네이버 인가 URL
  private getNaverAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });
    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  // 구글 인가 URL
  private getGoogleAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'openid email profile',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // 콜백 처리: code -> 토큰 교환 -> 사용자 정보 조회 -> 로그인/가입
  async handleCallback(
    provider: SocialProvider,
    code: string,
  ): Promise<TokenResponse & { user: { id: string; email: string } }> {
    // 1. code로 access_token 교환
    const accessToken = await this.exchangeCodeForToken(provider, code);

    // 2. access_token으로 사용자 정보 조회
    const socialUser = await this.getUserInfo(provider, accessToken);

    // 3. OAuthAccount 조회 또는 생성
    const user = await this.findOrCreateUser(socialUser);

    // 4. JWT 토큰 발급
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  // code -> access_token 교환
  private async exchangeCodeForToken(
    provider: SocialProvider,
    code: string,
  ): Promise<string> {
    const serverUrl = this.configService.get<string>('AUTH_SERVER_URL');
    const redirectUri = `${serverUrl}/api/auth/social/${provider}/callback`;

    switch (provider) {
      case 'kakao':
        return this.exchangeKakaoToken(code, redirectUri);
      case 'naver':
        return this.exchangeNaverToken(code, redirectUri);
      case 'google':
        return this.exchangeGoogleToken(code, redirectUri);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  // 카카오 토큰 교환
  private async exchangeKakaoToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET');

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        `Kakao token exchange failed: ${data.error_description || data.error}`,
      );
    }

    return data.access_token;
  }

  // 네이버 토큰 교환
  private async exchangeNaverToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');

    const response = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new BadRequestException(
        `Naver token exchange failed: ${data.error_description || data.error}`,
      );
    }

    return data.access_token;
  }

  // 구글 토큰 교환
  private async exchangeGoogleToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        `Google token exchange failed: ${data.error_description || data.error}`,
      );
    }

    return data.access_token;
  }

  // access_token으로 사용자 정보 조회
  private async getUserInfo(
    provider: SocialProvider,
    accessToken: string,
  ): Promise<SocialUserInfo> {
    switch (provider) {
      case 'kakao':
        return this.getKakaoUserInfo(accessToken);
      case 'naver':
        return this.getNaverUserInfo(accessToken);
      case 'google':
        return this.getGoogleUserInfo(accessToken);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  // 카카오 사용자 정보 조회
  private async getKakaoUserInfo(accessToken: string): Promise<SocialUserInfo> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException('Failed to get Kakao user info');
    }

    const email = data.kakao_account?.email;
    if (!email) {
      throw new BadRequestException(
        'Email is required. Please allow email access in Kakao.',
      );
    }

    return {
      provider: 'kakao',
      providerUserId: String(data.id),
      email,
      name: data.kakao_account?.profile?.nickname,
    };
  }

  // 네이버 사용자 정보 조회
  private async getNaverUserInfo(accessToken: string): Promise<SocialUserInfo> {
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok || data.resultcode !== '00') {
      throw new BadRequestException('Failed to get Naver user info');
    }

    const email = data.response?.email;
    if (!email) {
      throw new BadRequestException(
        'Email is required. Please allow email access in Naver.',
      );
    }

    return {
      provider: 'naver',
      providerUserId: data.response.id,
      email,
      name: data.response.name || data.response.nickname,
    };
  }

  // 구글 사용자 정보 조회
  private async getGoogleUserInfo(
    accessToken: string,
  ): Promise<SocialUserInfo> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException('Failed to get Google user info');
    }

    if (!data.email) {
      throw new BadRequestException(
        'Email is required. Please allow email access in Google.',
      );
    }

    return {
      provider: 'google',
      providerUserId: data.id,
      email: data.email,
      name: data.name,
    };
  }

  // OAuthAccount 조회 또는 User 생성/연동
  private async findOrCreateUser(
    socialUser: SocialUserInfo,
  ): Promise<{ id: string; email: string }> {
    const { provider, providerUserId, email, name } = socialUser;

    // 1. 기존 OAuthAccount 조회
    const existingOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      // 이미 연동된 계정이 있으면 해당 User 반환
      return { id: existingOAuth.user.id, email: existingOAuth.user.email };
    }

    // 2. 이메일로 기존 User 조회 (자동 연동)
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 기존 User에 OAuthAccount 연결
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider,
          providerUserId,
        },
      });
      return { id: existingUser.id, email: existingUser.email };
    }

    // 3. 새 User + OAuthAccount 생성
    // 소셜 로그인 사용자는 임의의 비밀번호 생성 (직접 로그인 불가)
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        emailVerified: true, // 소셜 로그인은 이메일 인증된 것으로 간주
        oauthAccounts: {
          create: {
            provider,
            providerUserId,
          },
        },
      },
    });

    return { id: newUser.id, email: newUser.email };
  }

  // JWT 토큰 생성
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenResponse> {
    const accessPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.refreshExpiresIn,
    });

    // Refresh Token DB 저장
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
    };
  }

  // 만료 시간 문자열 -> 초 변환
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  // state 생성 (CSRF 방지)
  generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

