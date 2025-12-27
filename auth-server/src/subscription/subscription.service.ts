import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { GumroadWebhookDto } from './dto/gumroad-webhook.dto';
import {
  SubscriptionResponseDto,
  SubscriptionStatusResponseDto,
} from './dto/subscription-response.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private prisma: PrismaService) {}

  // 사용자의 모든 구독 조회
  async getUserSubscriptions(userId: string): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
    });

    // 서비스 정보도 함께 가져오기
    const serviceCodes = subscriptions.map((s) => s.serviceCode);
    const services = await this.prisma.service.findMany({
      where: { code: { in: serviceCodes } },
    });

    const serviceMap = new Map(services.map((s) => [s.code, s]));

    return subscriptions.map((sub) => ({
      serviceCode: sub.serviceCode,
      serviceName: serviceMap.get(sub.serviceCode)?.name,
      plan: sub.plan,
      status: sub.status,
      purchasedAt: sub.purchasedAt || undefined,
      expiresAt: sub.expiresAt || undefined,
    }));
  }

  // 특정 서비스 구독 상태 조회
  async getSubscriptionStatus(
    userId: string,
    serviceCode: string,
  ): Promise<SubscriptionStatusResponseDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        userId_serviceCode: {
          userId,
          serviceCode,
        },
      },
    });

    if (!subscription) {
      return {
        hasAccess: false,
        plan: 'FREE',
        status: 'NONE',
      };
    }

    // 만료 확인
    const isExpired =
      subscription.expiresAt && subscription.expiresAt < new Date();
    const effectiveStatus = isExpired ? 'EXPIRED' : subscription.status;

    return {
      hasAccess:
        effectiveStatus === 'ACTIVE' && subscription.plan !== 'FREE',
      plan: subscription.plan,
      status: effectiveStatus,
      expiresAt: subscription.expiresAt || undefined,
    };
  }

  // Gumroad Webhook 처리
  async handleGumroadWebhook(payload: GumroadWebhookDto): Promise<void> {
    this.logger.log(
      `Processing Gumroad webhook: product_id=${payload.product_id}, email=${payload.email}`,
    );

    // 환불 처리
    if (payload.refunded === 'true') {
      await this.handleRefund(payload);
      return;
    }

    // 이메일로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      this.logger.warn(`User not found for email: ${payload.email}`);
      // 사용자가 없어도 에러를 던지지 않음 (나중에 가입할 수 있음)
      // 대신 pending_subscriptions 테이블에 저장할 수도 있음
      return;
    }

    // 상품 ID로 서비스 찾기
    const service = await this.prisma.service.findFirst({
      where: { gumroadProductId: payload.product_id },
    });

    if (!service) {
      this.logger.warn(`Service not found for product_id: ${payload.product_id}`);
      return;
    }

    // 구독 생성 또는 업데이트
    await this.prisma.subscription.upsert({
      where: {
        userId_serviceCode: {
          userId: user.id,
          serviceCode: service.code,
        },
      },
      update: {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        gumroadSaleId: payload.sale_id,
        purchasedAt: new Date(payload.sale_timestamp),
        // 만료일은 구독 상품인 경우에만 설정
        // 평생 라이센스인 경우 null
      },
      create: {
        userId: user.id,
        serviceCode: service.code,
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        gumroadSaleId: payload.sale_id,
        purchasedAt: new Date(payload.sale_timestamp),
      },
    });

    this.logger.log(
      `Subscription activated: user=${user.id}, service=${service.code}`,
    );
  }

  // 환불 처리
  private async handleRefund(payload: GumroadWebhookDto): Promise<void> {
    this.logger.log(`Processing refund: sale_id=${payload.sale_id}`);

    // sale_id로 구독 찾아서 취소 처리
    const subscription = await this.prisma.subscription.findFirst({
      where: { gumroadSaleId: payload.sale_id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          plan: SubscriptionPlan.FREE,
        },
      });

      this.logger.log(`Subscription cancelled due to refund: ${subscription.id}`);
    }
  }

  // 서비스 생성 (관리자용)
  async createService(
    code: string,
    name: string,
    gumroadProductId?: string,
    description?: string,
  ) {
    return this.prisma.service.create({
      data: {
        code,
        name,
        description,
        gumroadProductId,
      },
    });
  }

  // 서비스 목록 조회
  async getServices() {
    return this.prisma.service.findMany();
  }

  // 수동 구독 부여 (관리자용)
  async grantSubscription(
    userId: string,
    serviceCode: string,
    plan: SubscriptionPlan = SubscriptionPlan.PRO,
    expiresAt?: Date,
  ) {
    // 서비스 존재 확인
    const service = await this.prisma.service.findUnique({
      where: { code: serviceCode },
    });

    if (!service) {
      throw new NotFoundException(`Service not found: ${serviceCode}`);
    }

    return this.prisma.subscription.upsert({
      where: {
        userId_serviceCode: {
          userId,
          serviceCode,
        },
      },
      update: {
        plan,
        status: SubscriptionStatus.ACTIVE,
        purchasedAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        serviceCode,
        plan,
        status: SubscriptionStatus.ACTIVE,
        purchasedAt: new Date(),
        expiresAt,
      },
    });
  }
}

