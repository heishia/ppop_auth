#!/usr/bin/env node

/**
 * Auth API 자동 테스트 스크립트
 * 
 * 사용법:
 *   node scripts/test-auth.js [API_URL]
 * 
 * 예시:
 *   node scripts/test-auth.js http://localhost:3000
 *   node scripts/test-auth.js https://auth-api.yourdomain.com
 */

// fetch polyfill for Node.js < 18
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    // Node.js 18+ has built-in fetch
    fetch = globalThis.fetch;
  } catch (e) {
    // Try to use node-fetch if available
    try {
      fetch = require('node-fetch');
    } catch (e2) {
      console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch:');
      console.error('  npm install --save-dev node-fetch');
      process.exit(1);
    }
  }
} else {
  fetch = globalThis.fetch;
}

const API_URL = process.argv[2] || process.env.AUTH_API_URL || 'http://localhost:3000';

// 테스트 결과 색상
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

// 테스트 헬퍼 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  testResults.total++;
  log(`\n[테스트 ${testResults.total}] ${name}`, 'cyan');
}

function logPass(message) {
  testResults.passed++;
  log(`  ✓ ${message}`, 'green');
}

function logFail(message, error) {
  testResults.failed++;
  log(`  ✗ ${message}`, 'red');
  if (error) {
    log(`    에러: ${error.message || error}`, 'red');
  }
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'blue');
}

// API 요청 헬퍼
async function request(endpoint, options = {}) {
  const url = `${API_URL.replace(/\/$/, '')}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
    headers: response.headers,
  };
}

// 랜덤 이메일 생성
function generateEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
}

// 테스트 데이터
const testUser = {
  email: generateEmail(),
  password: 'Test123!@#',
  name: '테스트 사용자',
  birthdate: '990120',
};

let accessToken = null;
let refreshToken = null;
let userId = null;
let authCode = null;

// 서버 연결 확인
async function checkServerConnection() {
  logTest('서버 연결 확인');
  
  try {
    // Health 엔드포인트 시도
    const healthResponse = await request('/api/health', {
      method: 'GET',
    });

    if (healthResponse.ok) {
      logPass('서버 연결 성공 (health check 통과)');
      return true;
    }

    // Health 엔드포인트가 없으면 다른 엔드포인트로 확인
    const testResponse = await request('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer test',
      },
    });

    // 401 (Unauthorized)는 서버가 응답한다는 의미
    if (testResponse.status === 401 || testResponse.status === 400) {
      logPass('서버 연결 성공 (서버가 응답함)');
      return true;
    }

    logFail('서버 응답 이상', `Status: ${testResponse.status}`);
    return false;
  } catch (error) {
    logFail('서버 연결 실패', error);
    logInfo(`\n서버가 실행 중인지 확인하세요: ${API_URL}`);
    logInfo('서버 실행 방법:', 'yellow');
    logInfo('  1. 새 터미널에서: npm run dev:server', 'yellow');
    logInfo('  2. 또는: cd auth-server && npm run start:dev', 'yellow');
    logInfo('\n서버가 실행 중이라면 다음을 확인하세요:', 'yellow');
    logInfo('  - 포트가 올바른지 확인 (기본값: 3000)', 'yellow');
    logInfo('  - 방화벽이나 보안 소프트웨어가 차단하지 않는지 확인', 'yellow');
    return false;
  }
}

// 테스트 실행
async function runTests() {
  log('\n========================================', 'yellow');
  log('  PPOP Auth API 자동 테스트', 'yellow');
  log('========================================', 'yellow');
  log(`\nAPI URL: ${API_URL}`, 'blue');
  log(`테스트 사용자: ${testUser.email}\n`, 'blue');

  // 서버 연결 확인
  const serverConnected = await checkServerConnection();
  if (!serverConnected) {
    log('\n서버 연결 실패로 테스트를 중단합니다.', 'red');
    printResults();
    process.exit(1);
  }

  try {
    // 1. 회원가입 테스트
    await testRegister();

    // 2. 로그인 테스트
    await testLogin();

    // 3. 토큰 검증 테스트
    await testTokenValidation();

    // 4. 토큰 갱신 테스트
    await testTokenRefresh();

    // 5. OAuth 인증 플로우 테스트
    await testOAuthFlow();

    // 6. 내 정보 조회 테스트
    await testGetMe();

    // 결과 출력
    printResults();
  } catch (error) {
    log(`\n치명적 오류: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 1. 회원가입 테스트
async function testRegister() {
  logTest('회원가입 (기본)');

  try {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (response.ok && response.data.accessToken) {
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
      userId = response.data.user.id;
      logPass('회원가입 성공');
      logInfo(`사용자 ID: ${userId}`);
      logInfo(`이메일: ${response.data.user.email}`);
    } else {
      logFail('회원가입 실패', response.data);
    }
  } catch (error) {
    logFail('회원가입 요청 실패', error);
  }
}

// 2. 로그인 테스트
async function testLogin() {
  logTest('로그인');

  try {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (response.ok && response.data.accessToken) {
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
      logPass('로그인 성공');
      logInfo(`Access Token: ${accessToken.substring(0, 20)}...`);
    } else {
      logFail('로그인 실패', response.data);
    }
  } catch (error) {
    logFail('로그인 요청 실패', error);
  }
}

// 3. 토큰 검증 테스트
async function testTokenValidation() {
  logTest('토큰 검증 (내 정보 조회)');

  if (!accessToken) {
    logFail('토큰이 없어서 테스트 불가');
    return;
  }

  try {
    const response = await request('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok && response.data.id) {
      logPass('토큰 검증 성공');
      logInfo(`사용자 ID: ${response.data.id}`);
      logInfo(`이메일: ${response.data.email}`);
      logInfo(`상태: ${response.data.status}`);
    } else {
      logFail('토큰 검증 실패', response.data);
    }
  } catch (error) {
    logFail('토큰 검증 요청 실패', error);
  }
}

// 4. 토큰 갱신 테스트
async function testTokenRefresh() {
  logTest('토큰 갱신');

  if (!refreshToken) {
    logFail('Refresh Token이 없어서 테스트 불가');
    return;
  }

  try {
    const response = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (response.ok && response.data.accessToken) {
      const oldToken = accessToken;
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
      logPass('토큰 갱신 성공');
      logInfo(`새 Access Token: ${accessToken.substring(0, 20)}...`);
      if (oldToken !== accessToken) {
        logPass('토큰이 실제로 갱신됨');
      }
    } else {
      logFail('토큰 갱신 실패', response.data);
    }
  } catch (error) {
    logFail('토큰 갱신 요청 실패', error);
  }
}

// 5. OAuth 인증 플로우 테스트
async function testOAuthFlow() {
  logTest('OAuth 인증 플로우');

  if (!accessToken) {
    logFail('토큰이 없어서 테스트 불가');
    return;
  }

  const clientId = 'ppop_auth_client';
  const redirectUri = 'https://ppoplink.site/auth/callback';
  const state = 'test_state_' + Date.now();

  try {
    // OAuth authorize 요청 (로그인 페이지로 리다이렉트)
    logInfo('1. OAuth authorize 요청 테스트');
    const authorizeResponse = await request(
      `/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`,
      {
        method: 'GET',
        redirect: 'manual',
      }
    );

    if (authorizeResponse.status === 302 || authorizeResponse.status === 301) {
      logPass('OAuth authorize 요청 성공 (리다이렉트)');
    } else {
      logFail('OAuth authorize 요청 실패', authorizeResponse.data);
    }

    // OAuth callback 요청 (인증 코드 발급)
    logInfo('2. OAuth callback 요청 테스트');
    const callbackResponse = await request(
      `/oauth/authorize/callback?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: 'manual',
      }
    );

    if (callbackResponse.status === 302 || callbackResponse.status === 301) {
      const location = callbackResponse.headers.get('location') || '';
      if (location.includes('code=')) {
        const urlParams = new URLSearchParams(location.split('?')[1]);
        authCode = urlParams.get('code');
        logPass('OAuth callback 성공 (인증 코드 발급)');
        logInfo(`인증 코드: ${authCode?.substring(0, 20)}...`);
      } else {
        logFail('OAuth callback에서 인증 코드를 찾을 수 없음');
      }
    } else {
      logFail('OAuth callback 요청 실패', callbackResponse.data);
    }
  } catch (error) {
    logFail('OAuth 플로우 테스트 실패', error);
  }
}

// 6. 내 정보 조회 테스트
async function testGetMe() {
  logTest('내 정보 조회');

  if (!accessToken) {
    logFail('토큰이 없어서 테스트 불가');
    return;
  }

  try {
    const response = await request('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok && response.data.id) {
      logPass('내 정보 조회 성공');
      logInfo(`사용자 ID: ${response.data.id}`);
      logInfo(`이메일: ${response.data.email}`);
      logInfo(`상태: ${response.data.status}`);
      logInfo(`이메일 인증: ${response.data.emailVerified}`);
    } else {
      logFail('내 정보 조회 실패', response.data);
    }
  } catch (error) {
    logFail('내 정보 조회 요청 실패', error);
  }
}

// 결과 출력
function printResults() {
  log('\n========================================', 'yellow');
  log('  테스트 결과', 'yellow');
  log('========================================', 'yellow');
  log(`\n총 테스트: ${testResults.total}`, 'cyan');
  log(`성공: ${testResults.passed}`, 'green');
  log(`실패: ${testResults.failed}`, 'red');
  
  if (testResults.failed === 0) {
    log('\n모든 테스트 통과!', 'green');
    process.exit(0);
  } else {
    log('\n일부 테스트 실패', 'red');
    process.exit(1);
  }
}

// 실행
runTests().catch((error) => {
  log(`\n치명적 오류: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

