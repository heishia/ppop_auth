import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, ExtendedRegisterDto, RefreshDto, LoginDto, LogoutQueryDto } from './dto';
import { LocalAuthGuard, JwtAuthGuard, RefreshAuthGuard, OptionalJwtAuthGuard } from './guards';
import { PasswordValidatorPipe } from '../common/password-validator.pipe';

@Controller('auth')
export class AuthController {
  private allowedDomains: string[];
  private authClientUrl: string;
  private isProduction: boolean;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.authClientUrl = this.configService.get<string>('AUTH_CLIENT_URL') || 'http://localhost:3001';
    this.isProduction = process.env.NODE_ENV === 'production';

    const logoutDomainsEnv = this.configService.get<string>('LOGOUT_ALLOWED_DOMAINS');
    const defaultDomains = [
      'https://ppoplink.site',
      'https://www.ppoplink.site',
      'https://frontend-production-349a.up.railway.app',
      this.authClientUrl,
    ];

    if (logoutDomainsEnv) {
      this.allowedDomains = logoutDomainsEnv.split(',').map(d => d.trim());
    } else {
      this.allowedDomains = defaultDomains;
    }
  }

  // POST /auth/register - 기본 회원가입
  @UsePipes(PasswordValidatorPipe)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  // POST /auth/register/extended - 확장된 회원가입 (프로필 + 전화번호 인증)
  @UsePipes(PasswordValidatorPipe)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register/extended')
  async registerExtended(@Body() dto: ExtendedRegisterDto) {
    return this.authService.registerExtended(dto);
  }

  // POST /auth/login - 로그인
  // Brute Force 방지: 1분에 5회 시도
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Request() req: any) {
    return this.authService.login(req.user);
  }

  // POST /auth/refresh - 토큰 갱신
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Body() dto: RefreshDto) {
    return this.authService.refresh(
      req.user.userId,
      req.user.email,
      dto.refreshToken,
    );
  }

  // POST /auth/logout - 로그아웃
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Body() body: { refreshToken: string }) {
    await this.authService.logout(req.user.id, body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('logout')
  async logoutPage(
    @Query() query: LogoutQueryDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    if (req.user && req.user.id) {
      await this.authService.logoutAll(req.user.id);
    }

    let redirectUrl = this.authClientUrl;

    if (query.returnUrl) {
      const isAllowed = this.isAllowedDomain(query.returnUrl);
      if (isAllowed) {
        redirectUrl = query.returnUrl;
      }
    }

    res.redirect(redirectUrl);
  }

  private isAllowedDomain(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const fullUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

      if (this.allowedDomains.includes(fullUrl)) {
        return true;
      }

      if (!this.isProduction && (url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:'))) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // GET /auth/me - 내 정보
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return req.user;
  }
}
