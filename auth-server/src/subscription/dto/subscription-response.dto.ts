// 구독 정보 응답 DTO
export class SubscriptionResponseDto {
  serviceCode: string;
  serviceName?: string;
  plan: 'NONE' | 'BASIC' | 'PRO';
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
  hasAccess: boolean;           // 서비스 사용 가능 여부 (BASIC 이상)
  plan: 'NONE' | 'BASIC' | 'PRO';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'NONE';
  expiresAt?: Date;
}

