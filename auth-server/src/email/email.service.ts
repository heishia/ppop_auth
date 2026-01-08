import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

const EMAIL_CONFIG = {
  TOKEN_EXPIRES_HOURS: 24,
  MAX_DAILY_REQUESTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
};

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly verifyUrl: string;
  private readonly isConfigured: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
    this.verifyUrl = this.configService.get<string>('EMAIL_VERIFY_URL') || 'http://localhost:3000/auth/verify-email';

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
    }
  }

  async sendVerificationEmail(userId: string, email: string): Promise<{ message: string; expiresIn: number }> {
    await this.checkRateLimit(email);

    const token = require('crypto').randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_CONFIG.TOKEN_EXPIRES_HOURS);

    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });

    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    await this.updateRateLimit(email);

    const verifyLink = `${this.verifyUrl}?token=${token}`;
    await this.sendEmail(email, verifyLink);

    return {
      message: 'Verification email sent successfully',
      expiresIn: EMAIL_CONFIG.TOKEN_EXPIRES_HOURS * 3600,
    };
  }

  async verifyEmail(token: string): Promise<{ verified: boolean; userId: string }> {
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { token },
    });

    if (pending) {
      return this.verifyPendingRegistration(pending);
    }

    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      await this.prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException('Verification token expired. Please request a new one.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerification.delete({
        where: { id: verification.id },
      }),
    ]);

    return {
      verified: true,
      userId: verification.userId,
    };
  }

  private async verifyPendingRegistration(
    pending: { id: string; email: string; passwordHash: string; name: string | null; birthdate: string | null; phone: string | null; phoneVerified: boolean; expiresAt: Date }
  ): Promise<{ verified: boolean; userId: string }> {
    if (pending.expiresAt < new Date()) {
      await this.prisma.pendingRegistration.delete({
        where: { id: pending.id },
      });
      throw new BadRequestException('Verification token expired. Please register again.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: pending.email },
    });
    if (existingUser) {
      await this.prisma.pendingRegistration.delete({
        where: { id: pending.id },
      });
      throw new BadRequestException('Email already registered. Please login.');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: pending.email,
          passwordHash: pending.passwordHash,
          name: pending.name,
          birthdate: pending.birthdate,
          phone: pending.phone,
          phoneVerified: pending.phoneVerified,
          emailVerified: true,
        },
      });

      await tx.pendingRegistration.delete({
        where: { id: pending.id },
      });

      return newUser;
    });

    return {
      verified: true,
      userId: user.id,
    };
  }

  async sendPendingVerificationEmail(email: string, token: string): Promise<{ message: string; expiresIn: number }> {
    await this.checkRateLimit(email);
    await this.updateRateLimit(email);

    const verifyLink = `${this.verifyUrl}?token=${token}`;
    await this.sendEmail(email, verifyLink);

    return {
      message: 'Verification email sent successfully',
      expiresIn: EMAIL_CONFIG.TOKEN_EXPIRES_HOURS * 3600,
    };
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });
    return user?.emailVerified ?? false;
  }

  private async checkRateLimit(email: string): Promise<void> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let rateLimit = await this.prisma.emailRateLimit.findUnique({
      where: { email },
    });

    if (rateLimit && rateLimit.resetAt < todayStart) {
      rateLimit = await this.prisma.emailRateLimit.update({
        where: { email },
        data: {
          dailyCount: 0,
          resetAt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      });
    }

    if (rateLimit && rateLimit.dailyCount >= EMAIL_CONFIG.MAX_DAILY_REQUESTS) {
      throw new HttpException(
        'Daily email limit exceeded. Please try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (rateLimit?.lastSentAt) {
      const cooldownEnd = new Date(
        rateLimit.lastSentAt.getTime() + EMAIL_CONFIG.RESEND_COOLDOWN_SECONDS * 1000,
      );
      if (cooldownEnd > now) {
        const remainingSeconds = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
        throw new HttpException(
          `Please wait ${remainingSeconds} seconds before requesting a new email.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
  }

  private async updateRateLimit(email: string): Promise<void> {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    await this.prisma.emailRateLimit.upsert({
      where: { email },
      update: {
        dailyCount: { increment: 1 },
        lastSentAt: now,
      },
      create: {
        email,
        dailyCount: 1,
        lastSentAt: now,
        resetAt: tomorrow,
      },
    });
  }

  private async sendEmail(to: string, verifyLink: string): Promise<void> {
    const subject = '[PPOP] 이메일 인증을 완료해주세요';
    const html = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #155DFC; font-size: 32px; margin: 0;">PPOP</h1>
        </div>
        <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">이메일 인증</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${verifyLink}" style="display: inline-block; padding: 16px 48px; background-color: #155DFC; color: white; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: bold;">
            이메일 인증하기
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
          버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br/>
          <a href="${verifyLink}" style="color: #155DFC; word-break: break-all;">${verifyLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          이 링크는 ${EMAIL_CONFIG.TOKEN_EXPIRES_HOURS}시간 후에 만료됩니다.
        </p>
      </div>
    `;

    if (!this.isConfigured || !this.resend) {
      console.log(`[EMAIL MOCK] To: ${to}`);
      console.log(`[EMAIL MOCK] Verify Link: ${verifyLink}`);
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new BadRequestException('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Email send error:', error);
      throw new BadRequestException('Failed to send email. Please try again.');
    }
  }
}
