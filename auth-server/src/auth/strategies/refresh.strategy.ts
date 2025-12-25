import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { loadPublicKey } from '../../common/key-loader';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    // 공개키 로드 (환경변수 또는 파일)
    const publicKey = loadPublicKey();

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

