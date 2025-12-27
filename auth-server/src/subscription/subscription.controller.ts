import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GumroadWebhookDto } from './dto/gumroad-webhook.dto';
import { LatpeedWebhookDto } from './dto/latpeed-webhook.dto';
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

  // Latpeed Webhook 엔드포인트
  // URL 예시: /api/webhooks/latpeed?service=ppop-link&plan=PRO
  @Post('webhooks/latpeed')
  @SkipThrottle() // Rate limiting 제외
  @HttpCode(HttpStatus.OK)
  async handleLatpeedWebhook(
    @Body() payload: LatpeedWebhookDto,
    @Query('service') serviceCode?: string,
    @Query('plan') planParam?: string,
  ) {
    this.logger.log(`Received Latpeed webhook: ${JSON.stringify(payload)}`);

    // 서비스 코드 필수 확인
    if (!serviceCode) {
      this.logger.error('Latpeed webhook missing service query param');
      throw new BadRequestException(
        'Missing service query parameter. URL should be: /api/webhooks/latpeed?service=YOUR_SERVICE_CODE',
      );
    }

    // 플랜 결정 (기본값: PRO)
    let plan = SubscriptionPlan.PRO;
    if (planParam) {
      const upperPlan = planParam.toUpperCase();
      if (upperPlan === 'BASIC') {
        plan = SubscriptionPlan.BASIC;
      } else if (upperPlan === 'PRO') {
        plan = SubscriptionPlan.PRO;
      }
    }

    try {
      const result = await this.subscriptionService.handleLatpeedWebhook(
        payload,
        serviceCode,
        plan,
      );
      return result;
    } catch (error) {
      this.logger.error(`Latpeed webhook processing failed: ${error}`);
      // Latpeed에게 성공 응답을 보내서 재시도 방지
      return { success: false, error: 'Internal processing error' };
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

