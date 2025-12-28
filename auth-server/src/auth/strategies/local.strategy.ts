import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email', // email 필드를 username으로 사용
      passwordField: 'password',
    });
  }

  // 이메일/비밀번호 검증
  async validate(email: string, password: string): Promise<any> {
    // 이메일로 사용자 조회
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login attempt failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 계정 상태 확인 (BANNED만 차단, ACTIVE와 PENDING은 허용)
    if (user.status === UserStatus.BANNED) {
      this.logger.warn(`Login attempt failed: Account banned for email: ${email}`);
      throw new UnauthorizedException('Account is banned');
    }

    // 비밀번호 검증
    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) {
      this.logger.warn(`Login attempt failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 제외하고 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    this.logger.log(`Login successful for email: ${email}, user ID: ${user.id}`);
    return result;
  }
}
