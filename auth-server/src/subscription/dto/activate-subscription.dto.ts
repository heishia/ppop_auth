import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

// 구독 플랜 타입
export enum PlanType {
  NONE = 'NONE', // 서비스 사용 불가
  BASIC = 'BASIC', // 무료 (회원가입 + 후기 유도)
  PRO = 'PRO', // 유료
}

// 관리자용 구독 활성화 DTO
export class ActivateSubscriptionDto {
  @IsEmail()
  email: string; // 구매자 이메일

  @IsString()
  serviceCode: string; // 서비스 코드 (예: 'ppop-link', 'ppop-editor')

  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType; // 플랜 (기본값: PRO)

  @IsString()
  @IsOptional()
  expiresInDays?: number; // 만료일 (일 단위, 미입력시 무제한)

  @IsString()
  @IsOptional()
  note?: string; // 메모 (어디서 결제했는지 등)
}

// 구독 취소 DTO
export class DeactivateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsString()
  serviceCode: string;
}
