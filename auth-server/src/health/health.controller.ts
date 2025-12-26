import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  health() {
    // Railway 헬스체크용 응답
    return { status: 'ok' };
  }
}


