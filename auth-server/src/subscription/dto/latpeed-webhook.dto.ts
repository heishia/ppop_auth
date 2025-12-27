import { IsString, IsEmail, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Latpeed 웹훅 폼 응답
class LatpeedFormResponse {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

// Latpeed 웹훅 동의 응답
class LatpeedAgreementResponse {
  @IsString()
  question: string;

  @IsBoolean()
  answer: boolean;
}

// Latpeed 웹훅 결제 정보
class LatpeedPayment {
  @IsString()
  name: string; // 구매자 이름

  @IsEmail()
  email: string; // 구매자 이메일

  @IsString()
  @IsOptional()
  phoneNumber?: string; // 전화번호

  @IsNumber()
  amount: number; // 결제 금액

  @IsString()
  status: 'SUCCESS' | 'CANCEL'; // 결제 상태

  @IsString()
  date: string; // 결제 일시 (ISO 8601)

  @IsString()
  @IsOptional()
  method?: string; // 결제 방법 (CARD 등)

  @IsString()
  @IsOptional()
  canceledReason?: string; // 취소 사유

  @IsString()
  @IsOptional()
  option?: string; // 옵션명

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LatpeedFormResponse)
  @IsOptional()
  forms?: LatpeedFormResponse[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LatpeedAgreementResponse)
  @IsOptional()
  agreements?: LatpeedAgreementResponse[];
}

// Latpeed 웹훅 메인 DTO
export class LatpeedWebhookDto {
  @IsString()
  type: 'NORMAL_PAYMENT' | 'MEMBERSHIP_PAYMENT'; // 결제 타입

  @ValidateNested()
  @Type(() => LatpeedPayment)
  payment: LatpeedPayment;
}

