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
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GumroadWebhookDto } from './dto/gumroad-webhook.dto';
import {
  ActivateSubscriptionDto,
  DeactivateSubscriptionDto,
} from './dto/activate-subscription.dto';
import {
  SubscriptionResponseDto,
  SubscriptionStatusResponseDto,
} from './dto/subscription-response.dto';
import { SubscriptionPlan } from '@prisma/client';

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

  constructor(
    private subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {}

  // API Key 검증 헬퍼
  private validateApiKey(apiKey: string | undefined): void {
    const adminApiKey = this.configService.get<string>('ADMIN_API_KEY');
    if (!adminApiKey) {
      throw new UnauthorizedException('Admin API key is not configured');
    }
    if (!apiKey || apiKey !== adminApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
  }

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

  // ============================================
  // 관리자용 API (Make/Zapier 자동화용)
  // ============================================

  // 구독 활성화 (이메일 기반)
  @Post('admin/subscriptions/activate')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async activateSubscription(
    @Headers('x-api-key') apiKey: string,
    @Body() dto: ActivateSubscriptionDto,
  ) {
    this.validateApiKey(apiKey);

    this.logger.log(
      `Admin API: Activating subscription for ${dto.email} on ${dto.serviceCode}`,
    );

    // 플랜 변환
    const plan = dto.plan
      ? SubscriptionPlan[dto.plan as keyof typeof SubscriptionPlan]
      : SubscriptionPlan.PRO;

    const result = await this.subscriptionService.activateByEmail(
      dto.email,
      dto.serviceCode,
      plan,
      dto.expiresInDays,
    );

    return result;
  }

  // 구독 취소 (이메일 기반)
  @Post('admin/subscriptions/deactivate')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async deactivateSubscription(
    @Headers('x-api-key') apiKey: string,
    @Body() dto: DeactivateSubscriptionDto,
  ) {
    this.validateApiKey(apiKey);

    this.logger.log(
      `Admin API: Deactivating subscription for ${dto.email} on ${dto.serviceCode}`,
    );

    const result = await this.subscriptionService.deactivateByEmail(
      dto.email,
      dto.serviceCode,
    );

    return result;
  }

  // 서비스 생성 (관리자용)
  @Post('admin/services')
  @SkipThrottle()
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Headers('x-api-key') apiKey: string,
    @Body() body: { code: string; name: string; description?: string },
  ) {
    this.validateApiKey(apiKey);

    const service = await this.subscriptionService.createService(
      body.code,
      body.name,
      undefined,
      body.description,
    );

    return { success: true, service };
  }
}

