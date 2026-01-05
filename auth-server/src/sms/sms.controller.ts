import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SmsService } from './sms.service';
import { SendSmsDto, VerifySmsDto } from './dto';

@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  @Throttle({ default: { ttl: 60000, limit: 1 } })
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendVerificationCode(@Body() dto: SendSmsDto) {
    throw new HttpException(
      '전화번호 인증은 아직 지원되지 않습니다. 곧 서비스될 예정입니다.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  @Throttle({ default: { ttl: 10000, limit: 5 } })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() dto: VerifySmsDto) {
    throw new HttpException(
      '전화번호 인증은 아직 지원되지 않습니다. 곧 서비스될 예정입니다.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
