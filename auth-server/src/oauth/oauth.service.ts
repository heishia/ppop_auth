import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OAuthService {
  private privateKey: string;
  private accessExpiresIn: number;
  private refreshExpiresIn: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // 비밀키 로드
    const privateKeyPath =
      this.configService.get<string>('JWT_PRIVATE_KEY_PATH') ||
      './keys/private.pem';
    const absolutePath = path.isAbsolute(privateKeyPath)
      ? privateKeyPath
      : path.join(process.cwd(), '..', privateKeyPath);
    this.privateKey = fs.readFileSync(absolutePath, 'utf8');

    // 만료 시간 설정
    const accessExpStr =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.accessExpiresIn = this.parseExpiresIn(accessExpStr);
    this.refreshExpiresIn = this.parseExpiresIn(refreshExpStr);
  }

  // OAuth Client 검증
  async validateClient(clientId: string, redirectUri: string): Promise<void> {
    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });

    if (!client) {
      throw new BadRequestException('Invalid client_id');
    }

    // redirect_uri 검증
    if (!client.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('Invalid redirect_uri');
    }
  }

  // Authorization Code 생성
  async createAuthorizationCode(
    userId: string,
    clientId: string,
    redirectUri: string,
    state?: string,
  ): Promise<string> {
    // 랜덤 코드 생성
    const code = crypto.randomBytes(32).toString('hex');

    // 5분 후 만료
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // DB에 저장
    await this.prisma.authorizationCode.create({
      data: {
        code,
        userId,
        clientId,
        redirectUri,
        state,
        expiresAt,
      },
    });

    return code;
  }

  // Authorization Code -> Token 교환
  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ) {
    // Client 검증
    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });

    if (!client) {
      throw new UnauthorizedException({
        error: 'invalid_client',
        error_description: 'Client not found',
      });
    }

    // Client Secret 검증
    const isValidSecret = await bcrypt.compare(
      clientSecret,
      client.clientSecretHash,
    );
    if (!isValidSecret) {
      throw new UnauthorizedException({
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      });
    }

    // Authorization Code 조회
    const authCode = await this.prisma.authorizationCode.findUnique({
      where: { code },
      include: { user: true },
    });

    if (!authCode) {
      throw new BadRequestException({
        error: 'invalid_grant',
        error_description: 'Authorization code not found',
      });
    }

    // 사용 여부 확인
    if (authCode.used) {
      throw new BadRequestException({
        error: 'invalid_grant',
        error_description: 'Authorization code already used',
      });
    }

    // 만료 여부 확인
    if (authCode.expiresAt < new Date()) {
      throw new BadRequestException({
        error: 'invalid_grant',
        error_description: 'Authorization code expired',
      });
    }

    // Client ID 일치 확인
    if (authCode.clientId !== clientId) {
      throw new BadRequestException({
        error: 'invalid_grant',
        error_description: 'Client ID mismatch',
      });
    }

    // Redirect URI 일치 확인
    if (authCode.redirectUri !== redirectUri) {
      throw new BadRequestException({
        error: 'invalid_grant',
        error_description: 'Redirect URI mismatch',
      });
    }

    // Code 사용 표시
    await this.prisma.authorizationCode.update({
      where: { id: authCode.id },
      data: { used: true },
    });

    // 토큰 생성
    const user = authCode.user;

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload as object, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(refreshPayload as object, {
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
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.accessExpiresIn,
    };
  }

  // OAuth Client 생성 (관리용)
  async createClient(name: string, redirectUris: string[]): Promise<{
    clientId: string;
    clientSecret: string;
  }> {
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const clientSecretHash = await bcrypt.hash(clientSecret, 10);

    await this.prisma.oAuthClient.create({
      data: {
        clientId,
        clientSecretHash,
        name,
        redirectUris,
      },
    });

    return { clientId, clientSecret };
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
}

