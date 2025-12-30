import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { loadPublicKey } from '../../common/key-loader';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private usersService: UsersService) {
    // 공개키 로드 (환경변수 또는 파일)
    let publicKey: string;
    try {
      publicKey = loadPublicKey();
      Logger.log('JWT Public key loaded successfully', JwtStrategy.name);
    } catch (error) {
      Logger.error('Failed to load JWT public key', error, JwtStrategy.name);
      throw error;
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  // JWT 페이로드 검증
  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT payload: type=${payload.type}, sub=${payload.sub}`);
    
    // Access Token인지 확인
    if (payload.type !== 'access') {
      this.logger.warn(`Invalid token type: ${payload.type}, expected 'access'`);
      throw new UnauthorizedException('Invalid token type');
    }

    // 사용자 존재 확인
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(`JWT validation successful for user: ${user.id}`);
    
    // user 객체에 sub 필드 추가 (payload의 sub와 동일)
    return {
      ...user,
      sub: payload.sub, // payload의 sub (userId)를 명시적으로 포함
    };
  }
}
