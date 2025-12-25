import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private configService: ConfigService) {
    // 공개키 로드
    const publicKeyPath =
      configService.get<string>('JWT_PUBLIC_KEY_PATH') || './keys/public.pem';
    const absolutePath = path.isAbsolute(publicKeyPath)
      ? publicKeyPath
      : path.join(process.cwd(), '..', publicKeyPath);
    const publicKey = fs.readFileSync(absolutePath, 'utf8');

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  // Refresh Token 검증
  async validate(req: Request, payload: JwtPayload) {
    // Refresh Token인지 확인
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 원본 토큰도 반환 (DB 검증용)
    const refreshToken = req.body.refreshToken;

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}

