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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, ExtendedRegisterDto, RefreshDto } from './dto';
import { LocalAuthGuard, JwtAuthGuard, RefreshAuthGuard } from './guards';
import { PasswordValidatorPipe } from '../common/password-validator.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async login(@Request() req: any) {
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

  // GET /auth/me - 내 정보
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return req.user;
  }
}
