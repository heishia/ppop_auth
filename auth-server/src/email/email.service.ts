import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  TOKEN_EXPIRES_HOURS: 24,
  MAX_DAILY_REQUESTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
};

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromEmail: string;
  private readonly verifyUrl: string;
  private readonly isConfigured: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    
    this.fromEmail = this.configService.get<string>('SMTP_FROM') || smtpUser || 'noreply@example.com';
    this.verifyUrl = this.configService.get<string>('EMAIL_VERIFY_URL') || 'http://localhost:3000/auth/verify-email';

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
    }
  }

  async sendVerificationEmail(userId: string, email: string): Promise<{ message: string; expiresIn: number }> {
    await this.checkRateLimit(email);

    const token = crypto.randomBytes(32).toString('hex');

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
    const subject = '[PPOP] Verify your email address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br/>
          <a href="${verifyLink}">${verifyLink}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in ${EMAIL_CONFIG.TOKEN_EXPIRES_HOURS} hours.
        </p>
      </div>
    `;

    if (!this.isConfigured || !this.transporter) {
      console.log(`[EMAIL MOCK] To: ${to}`);
      console.log(`[EMAIL MOCK] Verify Link: ${verifyLink}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Email send error:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[EMAIL FALLBACK] To: ${to}, Link: ${verifyLink}`);
      } else {
        throw new BadRequestException('Failed to send email. Please try again.');
      }
    }
  }
}
