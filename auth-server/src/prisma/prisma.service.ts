import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7: schema.prisma에 url이 없으므로, Driver Adapter로 연결을 주입해야 함
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      // DATABASE_URL 자체는 민감 정보라 값은 출력하지 않음
      throw new Error('DATABASE_URL is required');
    }

    // Transaction pooler 호환을 위한 Pool 설정
    const pool = new Pool({
      connectionString: databaseUrl,
      // Transaction pooler 최적화 설정
      max: 10, // 최대 연결 수
      idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
      connectionTimeoutMillis: 10000, // 연결 타임아웃
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
