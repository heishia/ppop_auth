import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * GlobalAdminGuard
 * isGlobalAdmin이 true인 사용자만 접근 가능
 * 관리자는 모든 SaaS 서비스에서 관리자 권한을 가지며,
 * 다른 사용자에게 관리자 권한을 부여/제거할 수도 있음
 */
@Injectable()
export class GlobalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!user.isGlobalAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

