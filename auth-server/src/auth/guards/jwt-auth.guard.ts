import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      this.logger.warn('No authorization header found');
    } else {
      this.logger.debug(`Authorization header present: ${authHeader.substring(0, 20)}...`);
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`JWT validation error: ${err.message}`, err.stack);
      throw err;
    }
    if (info) {
      this.logger.warn(`JWT validation info: ${info.message || JSON.stringify(info)}`);
    }
    if (!user) {
      this.logger.warn('JWT validation failed: no user returned');
    }
    return user;
  }
}
