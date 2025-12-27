// 구독 정보 응답 DTO
export class SubscriptionResponseDto {
  serviceCode: string;
  serviceName?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  purchasedAt?: Date;
  expiresAt?: Date;
}

// 구독 목록 응답 DTO
export class SubscriptionsListResponseDto {
  subscriptions: SubscriptionResponseDto[];
}

// 구독 상태 확인 응답 DTO
export class SubscriptionStatusResponseDto {
  hasAccess: boolean;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'NONE';
  expiresAt?: Date;
}

