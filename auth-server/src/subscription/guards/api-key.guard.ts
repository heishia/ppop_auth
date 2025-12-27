import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// API Key 기반 인증 가드 (관리자용 API)
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 헤더에서 API Key 추출
    const apiKey =
      request.headers['x-api-key'] || request.headers['authorization']?.replace('Bearer ', '');

    // 환경변수에서 설정된 Admin API Key와 비교
    const adminApiKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!adminApiKey) {
      throw new UnauthorizedException('Admin API key is not configured');
    }

    if (!apiKey || apiKey !== adminApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}

