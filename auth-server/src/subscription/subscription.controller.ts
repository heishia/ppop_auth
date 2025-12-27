import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GumroadWebhookDto } from './dto/gumroad-webhook.dto';
import {
  SubscriptionResponseDto,
  SubscriptionStatusResponseDto,
} from './dto/subscription-response.dto';

// Request 타입 확장
interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('api')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private subscriptionService: SubscriptionService) {}

  // Gumroad Webhook 엔드포인트
  @Post('webhooks/gumroad')
  @SkipThrottle() // Rate limiting 제외
  @HttpCode(HttpStatus.OK)
  async handleGumroadWebhook(@Body() payload: GumroadWebhookDto) {
    this.logger.log(`Received Gumroad webhook: ${JSON.stringify(payload)}`);

    try {
      await this.subscriptionService.handleGumroadWebhook(payload);
      return { success: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error}`);
      // Gumroad에게 성공 응답을 보내서 재시도 방지
      // 에러는 내부적으로 로깅
      return { success: true, error: 'Internal processing error' };
    }
  }

  // 내 구독 목록 조회
  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(
    @Req() req: RequestWithUser,
  ): Promise<{ subscriptions: SubscriptionResponseDto[] }> {
    const subscriptions = await this.subscriptionService.getUserSubscriptions(
      req.user.sub,
    );
    return { subscriptions };
  }

  // 특정 서비스 구독 상태 조회
  @Get('subscriptions/:serviceCode')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(
    @Req() req: RequestWithUser,
    @Param('serviceCode') serviceCode: string,
  ): Promise<SubscriptionStatusResponseDto> {
    return this.subscriptionService.getSubscriptionStatus(
      req.user.sub,
      serviceCode,
    );
  }

  // 서비스 목록 조회 (공개)
  @Get('services')
  async getServices() {
    const services = await this.subscriptionService.getServices();
    return { services };
  }
}

