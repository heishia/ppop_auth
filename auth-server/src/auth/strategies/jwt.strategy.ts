import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // 공개키 로드
    const publicKeyPath =
      configService.get<string>('JWT_PUBLIC_KEY_PATH') || './keys/public.pem';
    const absolutePath = path.isAbsolute(publicKeyPath)
      ? publicKeyPath
      : path.join(process.cwd(), '..', publicKeyPath);
    const publicKey = fs.readFileSync(absolutePath, 'utf8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  // JWT 페이로드 검증
  async validate(payload: JwtPayload) {
    // Access Token인지 확인
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 사용자 존재 확인
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}

