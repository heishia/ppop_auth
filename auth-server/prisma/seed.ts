// OAuth Client 시드 스크립트
// 사용법: npx ts-node prisma/seed.ts

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// 환경변수 로드 (현재 디렉토리와 상위 디렉토리 모두 확인)
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Error: DATABASE_URL is required');
  console.error(
    'Please create a .env file in auth-server directory with DATABASE_URL',
  );
  process.exit(1);
}

// Prisma 7: Driver Adapter 사용
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding OAuth clients...');

  // PPOP Auth 클라이언트 생성
  const clientId = 'ppop_auth_client';
  const clientSecret = 'ppop_secret_' + crypto.randomBytes(16).toString('hex');
  const clientSecretHash = await bcrypt.hash(clientSecret, 10);

  // 기존 클라이언트 삭제 (있으면)
  await prisma.oAuthClient.deleteMany({
    where: { clientId },
  });

  // 새 클라이언트 생성
  const client = await prisma.oAuthClient.create({
    data: {
      clientId,
      clientSecretHash,
      name: 'PPOP Auth Client',
      redirectUris: [
        'http://localhost:3000/auth/callback',
        'https://ppoplink.site/auth/callback',
        'http://localhost:3002/auth/callback',
        'http://localhost:3002/api/auth/callback',
      ],
    },
  });

  console.log('Created OAuth client:');
  console.log(`  Client ID: ${clientId}`);
  console.log(`  Client Secret: ${clientSecret}`);
  console.log(`  Name: ${client.name}`);
  console.log(`  Redirect URIs: ${client.redirectUris.join(', ')}`);
  console.log('');
  console.log('Save these credentials securely!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
