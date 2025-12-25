import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService, SafeUser } from '../users/users.service';
import {
  JwtPayload,
  TokenResponse,
  AuthResponse,
} from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private privateKey: string;
  private accessExpiresIn: number; // 초 단위
  private refreshExpiresIn: number; // 초 단위

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // 비밀키 로드
    const privateKeyPath =
      this.configService.get<string>('JWT_PRIVATE_KEY_PATH') ||
      './keys/private.pem';
    const absolutePath = path.isAbsolute(privateKeyPath)
      ? privateKeyPath
      : path.join(process.cwd(), '..', privateKeyPath);
    this.privateKey = fs.readFileSync(absolutePath, 'utf8');

    // 만료 시간 설정 (초 단위로 변환)
    const accessExpStr =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.accessExpiresIn = this.parseExpiresIn(accessExpStr);
    this.refreshExpiresIn = this.parseExpiresIn(refreshExpStr);
  }

  // 회원가입
  async register(email: string, password: string): Promise<AuthResponse> {
    // 사용자 생성
    const user = await this.usersService.create(email, password);

    // 토큰 발급
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    };
  }

  // 로그인 (LocalStrategy에서 검증 완료된 사용자)
  async login(user: SafeUser): Promise<AuthResponse> {
    // 토큰 발급
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    };
  }

  // 토큰 갱신
  async refresh(
    userId: string,
    email: string,
    refreshToken: string,
  ): Promise<TokenResponse> {
    // DB에서 Refresh Token 확인
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() }, // 만료되지 않은 토큰
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 토큰 해시 비교
    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 기존 토큰 삭제 (Token Rotation)
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // 새 토큰 발급
    return this.generateTokens(userId, email);
  }

  // 로그아웃
  async logout(userId: string, refreshToken: string): Promise<void> {
    // 해당 Refresh Token 삭제
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.delete({
          where: { id: token.id },
        });
        break;
      }
    }
  }

  // 토큰 생성
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenResponse> {
    // Access Token 페이로드
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    // Refresh Token 페이로드
    const refreshPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    // Access Token 생성
    const accessToken = this.jwtService.sign(accessPayload as object, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.accessExpiresIn,
    });

    // Refresh Token 생성
    const refreshToken = this.jwtService.sign(refreshPayload as object, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.refreshExpiresIn,
    });

    // Refresh Token DB 저장 (해시)
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
    if (!match) return 900; // 기본값 15분

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
}
