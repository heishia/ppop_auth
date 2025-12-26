import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SmsService } from './sms.service';
import { SendSmsDto, VerifySmsDto } from './dto';

@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  // POST /sms/send - SMS 인증번호 발송
  // 더 엄격한 Rate Limiting: 1분에 1회
  @Throttle({ default: { ttl: 60000, limit: 1 } })
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendVerificationCode(@Body() dto: SendSmsDto) {
    return this.smsService.sendVerificationCode(dto.phone);
  }

  // POST /sms/verify - SMS 인증번호 확인
  // Rate Limiting: 10초에 5회
  @Throttle({ default: { ttl: 10000, limit: 5 } })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() dto: VerifySmsDto) {
    return this.smsService.verifyCode(dto.phone, dto.code);
  }
}
