import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// 비밀번호를 제외한 사용자 정보 타입
export type SafeUser = Omit<User, 'passwordHash'>;

// 확장된 사용자 생성 옵션
export interface CreateUserOptions {
  email: string;
  password: string;
  name?: string;
  birthdate?: string;
  phone?: string;
  phoneVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 이메일로 사용자 조회 (비밀번호 포함)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ID로 사용자 조회 (비밀번호 제외)
  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // 사용자 생성 (기본)
  async create(email: string, password: string): Promise<SafeUser> {
    return this.createExtended({ email, password });
  }

  // 확장된 사용자 생성 (프로필 정보 포함)
  async createExtended(options: CreateUserOptions): Promise<SafeUser> {
    const { email, password, name, birthdate, phone, phoneVerified } = options;

    // 이메일 중복 확인
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 전화번호 중복 확인 (제공된 경우)
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // 비밀번호 해싱 (cost factor: 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        birthdate,
        phone,
        phoneVerified: phoneVerified ?? false,
        status: UserStatus.ACTIVE,
      },
    });

    // 비밀번호 제외하고 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  // 전화번호로 사용자 조회
  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  // 비밀번호 검증
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  // 사용자 상태 업데이트
  async updateStatus(id: string, status: UserStatus): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
