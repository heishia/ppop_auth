import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

// SMS 인증 설정 상수
const SMS_CONFIG = {
  CODE_LENGTH: 6,
  CODE_EXPIRES_MINUTES: 3,
  MAX_DAILY_REQUESTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
  MAX_VERIFY_ATTEMPTS: 5,
  BLOCK_DURATION_MINUTES: 30,
};

@Injectable()
export class SmsService {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly serviceId: string;
  private readonly senderPhone: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // 네이버 클라우드 SMS 설정 로드
    this.accessKey =
      this.configService.get<string>('NAVER_SMS_ACCESS_KEY') || '';
    this.secretKey =
      this.configService.get<string>('NAVER_SMS_SECRET_KEY') || '';
    this.serviceId =
      this.configService.get<string>('NAVER_SMS_SERVICE_ID') || '';
    this.senderPhone = this.configService.get<string>('NAVER_SMS_SENDER') || '';
  }

  // SMS 인증번호 발송
  async sendVerificationCode(
    phone: string,
  ): Promise<{ message: string; expiresIn: number }> {
    // Rate Limit 확인
    await this.checkRateLimit(phone);

    // 6자리 인증번호 생성
    const code = this.generateCode();

    // 만료 시간 계산 (3분)
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + SMS_CONFIG.CODE_EXPIRES_MINUTES,
    );

    // 기존 미사용 인증 코드 삭제
    await this.prisma.smsVerification.deleteMany({
      where: {
        phone,
        verified: false,
      },
    });

    // 새 인증 코드 저장
    await this.prisma.smsVerification.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // Rate Limit 업데이트
    await this.updateRateLimit(phone);

    // 실제 SMS 발송 (네이버 클라우드)
    await this.sendSms(phone, `[PPOP] Verification code: ${code}`);

    return {
      message: 'Verification code sent successfully',
      expiresIn: SMS_CONFIG.CODE_EXPIRES_MINUTES * 60,
    };
  }

  // SMS 인증번호 확인
  async verifyCode(
    phone: string,
    code: string,
  ): Promise<{ verified: boolean; verificationId: string }> {
    // 최신 인증 코드 조회
    const verification = await this.prisma.smsVerification.findFirst({
      where: {
        phone,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      throw new BadRequestException(
        'No verification code found. Please request a new one.',
      );
    }

    // 만료 확인
    if (verification.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    // 시도 횟수 확인
    if (verification.attempts >= SMS_CONFIG.MAX_VERIFY_ATTEMPTS) {
      // 차단 처리
      await this.blockPhone(phone);
      throw new HttpException(
        `Too many failed attempts. Please try again after ${SMS_CONFIG.BLOCK_DURATION_MINUTES} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 코드 일치 확인
    if (verification.code !== code) {
      // 시도 횟수 증가
      await this.prisma.smsVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 },
      });

      const remainingAttempts =
        SMS_CONFIG.MAX_VERIFY_ATTEMPTS - verification.attempts - 1;
      throw new BadRequestException(
        `Invalid verification code. ${remainingAttempts} attempts remaining.`,
      );
    }

    // 인증 성공 처리
    await this.prisma.smsVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return {
      verified: true,
      verificationId: verification.id,
    };
  }

  // 인증 완료 여부 확인 (회원가입 시 사용)
  async isPhoneVerified(
    verificationId: string,
    phone: string,
  ): Promise<boolean> {
    const verification = await this.prisma.smsVerification.findFirst({
      where: {
        id: verificationId,
        phone,
        verified: true,
        // 인증 후 10분 이내만 유효
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });

    return !!verification;
  }

  // Rate Limit 확인
  private async checkRateLimit(phone: string): Promise<void> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    let rateLimit = await this.prisma.smsRateLimit.findUnique({
      where: { phone },
    });

    // 차단 상태 확인
    if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (rateLimit.blockedUntil.getTime() - now.getTime()) / 60000,
      );
      throw new HttpException(
        `Phone number is blocked. Please try again after ${remainingMinutes} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 일일 리셋 확인
    if (rateLimit && rateLimit.resetAt < todayStart) {
      // 새로운 날 - 카운트 리셋
      rateLimit = await this.prisma.smsRateLimit.update({
        where: { phone },
        data: {
          dailyCount: 0,
          resetAt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          blockedUntil: null,
        },
      });
    }

    // 일일 발송 횟수 확인
    if (rateLimit && rateLimit.dailyCount >= SMS_CONFIG.MAX_DAILY_REQUESTS) {
      throw new HttpException(
        `Daily SMS limit exceeded. Please try again tomorrow.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 재전송 쿨다운 확인
    if (rateLimit?.lastSentAt) {
      const cooldownEnd = new Date(
        rateLimit.lastSentAt.getTime() +
          SMS_CONFIG.RESEND_COOLDOWN_SECONDS * 1000,
      );
      if (cooldownEnd > now) {
        const remainingSeconds = Math.ceil(
          (cooldownEnd.getTime() - now.getTime()) / 1000,
        );
        throw new HttpException(
          `Please wait ${remainingSeconds} seconds before requesting a new code.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
  }

  // Rate Limit 업데이트
  private async updateRateLimit(phone: string): Promise<void> {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    await this.prisma.smsRateLimit.upsert({
      where: { phone },
      update: {
        dailyCount: { increment: 1 },
        lastSentAt: now,
      },
      create: {
        phone,
        dailyCount: 1,
        lastSentAt: now,
        resetAt: tomorrow,
      },
    });
  }

  // 전화번호 차단
  private async blockPhone(phone: string): Promise<void> {
    const blockedUntil = new Date();
    blockedUntil.setMinutes(
      blockedUntil.getMinutes() + SMS_CONFIG.BLOCK_DURATION_MINUTES,
    );

    await this.prisma.smsRateLimit.upsert({
      where: { phone },
      update: { blockedUntil },
      create: {
        phone,
        dailyCount: SMS_CONFIG.MAX_DAILY_REQUESTS,
        blockedUntil,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  // 6자리 인증번호 생성
  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // 네이버 클라우드 SMS 발송
  private async sendSms(phone: string, message: string): Promise<void> {
    // 환경변수가 설정되지 않은 경우 Mock 모드
    if (!this.accessKey || !this.secretKey || !this.serviceId) {
      console.log(`[SMS MOCK] To: ${phone}, Message: ${message}`);
      return;
    }

    const timestamp = Date.now().toString();
    const url = `/sms/v2/services/${this.serviceId}/messages`;
    const signature = this.makeSignature(url, timestamp);

    const body = {
      type: 'SMS',
      from: this.senderPhone,
      content: message,
      messages: [{ to: phone }],
    };

    try {
      const response = await fetch(`https://sens.apigw.ntruss.com${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': this.accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('SMS send failed:', errorData);
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      // SMS 발송 실패해도 인증 코드는 저장되어 있으므로
      // 개발/테스트 환경에서는 로그로 확인 가능
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[SMS FALLBACK] To: ${phone}, Message: ${message}`);
      } else {
        throw new BadRequestException('Failed to send SMS. Please try again.');
      }
    }
  }

  // 네이버 클라우드 API 서명 생성
  private makeSignature(url: string, timestamp: string): string {
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';

    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url);
    hmac.update(newLine);
    hmac.update(timestamp);
    hmac.update(newLine);
    hmac.update(this.accessKey);

    return hmac.digest('base64');
  }
}
