import { Controller, Get } from '@nestjs/common';
import { JwksService } from './jwks.service';

@Controller('.well-known')
export class JwksController {
  constructor(private jwksService: JwksService) {}

  // GET /.well-known/jwks.json - JWT 공개키 (SaaS에서 토큰 검증용)
  @Get('jwks.json')
  getJwks() {
    return this.jwksService.getJwks();
  }
}
