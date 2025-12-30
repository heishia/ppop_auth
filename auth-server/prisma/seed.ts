// OAuth Client 시드 스크립트
// 사용법: npx ts-node prisma/seed.ts
//
// 환경 변수로 클라이언트 시크릿 지정 가능:
//   PPOP_LINK_CLIENT_SECRET=your_secret npx ts-node prisma/seed.ts

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// 환경변수 로드 (.env.local 우선, 없으면 .env)
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
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

// OAuth 클라이언트 정의
interface OAuthClientConfig {
  clientId: string;
  name: string;
  // 환경 변수 이름 (시크릿 지정용)
  secretEnvVar: string;
  redirectUris: string[];
}

// 등록할 OAuth 클라이언트 목록
const oauthClients: OAuthClientConfig[] = [
  {
    clientId: 'ppop-link',
    name: 'PPOPLINK Service',
    secretEnvVar: 'PPOP_LINK_CLIENT_SECRET',
    redirectUris: [
      // 개발 환경
      'http://localhost:3002/auth/callback',
      'http://localhost:3003/auth/callback',
      // 프로덕션 환경 (커스텀 도메인)
      'https://ppoplink.site/auth/callback',
      'https://www.ppoplink.site/auth/callback',
      // Railway 배포 환경
      'https://frontend-production-349a.up.railway.app/auth/callback',
    ],
  },
];

async function seedOAuthClient(config: OAuthClientConfig) {
  // 환경 변수에서 시크릿 가져오기, 없으면 랜덤 생성
  const existingSecret = process.env[config.secretEnvVar];
  const clientSecret =
    existingSecret || 'secret_' + crypto.randomBytes(24).toString('hex');
  const clientSecretHash = await bcrypt.hash(clientSecret, 10);

  // upsert: 있으면 업데이트, 없으면 생성
  const client = await prisma.oAuthClient.upsert({
    where: { clientId: config.clientId },
    update: {
      name: config.name,
      redirectUris: config.redirectUris,
      // 시크릿은 환경 변수로 명시적 지정된 경우에만 업데이트
      ...(existingSecret ? { clientSecretHash } : {}),
    },
    create: {
      clientId: config.clientId,
      clientSecretHash,
      name: config.name,
      redirectUris: config.redirectUris,
    },
  });

  console.log(`\nOAuth Client: ${config.name}`);
  console.log(`  Client ID: ${config.clientId}`);
  if (!existingSecret) {
    console.log(`  Client Secret: ${clientSecret}`);
    console.log(
      `  (Save this secret! Set ${config.secretEnvVar} env var to keep it fixed)`,
    );
  } else {
    console.log(`  Client Secret: [from ${config.secretEnvVar} env var]`);
  }
  console.log(`  Redirect URIs:`);
  client.redirectUris.forEach((uri) => console.log(`    - ${uri}`));

  return {
    clientId: config.clientId,
    clientSecret,
    isNewSecret: !existingSecret,
  };
}

// 등록할 서비스 목록 (구독 관리용)
interface ServiceConfig {
  code: string;
  name: string;
  description: string;
}

const services: ServiceConfig[] = [
  {
    code: 'ppop-link',
    name: 'PPOPLINK',
    description: 'Link in bio SaaS service for content creators',
  },
];

async function seedService(config: ServiceConfig) {
  const service = await prisma.service.upsert({
    where: { code: config.code },
    update: {
      name: config.name,
      description: config.description,
    },
    create: {
      code: config.code,
      name: config.name,
      description: config.description,
    },
  });

  console.log(`\nService: ${config.name}`);
  console.log(`  Code: ${service.code}`);
  console.log(`  Description: ${service.description || 'N/A'}`);
}

// 통합 관리자 계정 생성
async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ppop.cloud';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // 관리자 계정 생성 또는 업데이트
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isGlobalAdmin: true, // 기존 계정이면 관리자로 업데이트
    },
    create: {
      email: adminEmail,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      isGlobalAdmin: true,
      name: 'System Administrator',
    },
  });

  console.log(`\nGlobal Admin User:`);
  console.log(`  Email: ${adminEmail}`);
  console.log(`  User ID: ${admin.id}`);
  console.log(`  isGlobalAdmin: ${admin.isGlobalAdmin}`);
  
  const isNewPassword = !process.env.ADMIN_PASSWORD;
  if (isNewPassword) {
    console.log(`  Password: ${adminPassword}`);
    console.log(`  (Save this password! Set ADMIN_EMAIL and ADMIN_PASSWORD env vars)`);
  } else {
    console.log(`  Password: [from ADMIN_PASSWORD env var]`);
  }

  return { email: adminEmail, password: adminPassword, isNewPassword };
}

async function main() {
  console.log('===========================================');
  console.log('Seeding PPOP Auth Database...');
  console.log('===========================================');

  // 통합 관리자 계정 시드
  console.log('\n--- Global Admin User ---');
  const adminResult = await seedAdminUser();

  // OAuth 클라이언트 시드
  console.log('\n--- OAuth Clients ---');
  const results: {
    clientId: string;
    clientSecret: string;
    isNewSecret: boolean;
  }[] = [];
  for (const config of oauthClients) {
    const result = await seedOAuthClient(config);
    results.push(result);
  }

  // 서비스 시드
  console.log('\n--- Services ---');
  for (const config of services) {
    await seedService(config);
  }

  console.log('\n===========================================');
  console.log('Seeding completed!');
  console.log('===========================================');

  // 새로 생성된 시크릿이 있으면 경고
  const newSecrets = results.filter((r) => r.isNewSecret);
  if (newSecrets.length > 0 || adminResult.isNewPassword) {
    console.log('\n[IMPORTANT] Save these credentials securely:');
    
    if (adminResult.isNewPassword) {
      console.log(`\n  Admin Account:`);
      console.log(`    Email: ${adminResult.email}`);
      console.log(`    Password: ${adminResult.password}`);
      console.log(`    Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to keep them fixed`);
      console.log(`\n  Admin has full access to:`);
      console.log(`    - All SaaS services (admin features)`);
      console.log(`    - User management (grant/revoke admin roles)`);
    }
    
    if (newSecrets.length > 0) {
      console.log(`\n  OAuth Client Secrets:`);
      newSecrets.forEach((r) => {
        console.log(`    - ${r.clientId}: ${r.clientSecret}`);
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
