// OAuth Client 시드 스크립트
// 사용법: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding OAuth clients...');

  // 테스트용 SaaS 클라이언트 생성
  const clientId = 'test_saas_client';
  const clientSecret = 'test_secret_' + crypto.randomBytes(16).toString('hex');
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
      name: 'Test SaaS Application',
      redirectUris: [
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

