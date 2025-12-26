import * as fs from 'fs';
import * as path from 'path';

function normalizePemFromEnv(raw: string): string {
  // 환경변수 값에 따옴표가 붙는 경우 제거하고, 이스케이프된 개행/캐리지리턴을 정규화
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }

  // 사용자가 \n 형태로 넣는 경우 실제 개행으로 변환
  v = v.replace(/\\r/g, '');
  v = v.replace(/\\n/g, '\n');

  // 실제 CRLF가 섞여 들어오는 경우도 정리
  v = v.replace(/\r\n/g, '\n');
  v = v.replace(/\r/g, '\n');

  return v;
}

function looksLikePem(pem: string): boolean {
  const upper = pem.toUpperCase();
  return upper.includes('-----BEGIN') && upper.includes('-----END');
}

function wrapAsPem(kind: 'public' | 'private', body: string): string {
  // PEM 헤더/푸터가 없는 경우(키 바디만 들어온 경우) 자동으로 감싸기
  // base64 바디를 64자 라인으로 잘라 PEM 형태로 맞춘다.
  const cleaned = body.replace(/\s+/g, '');
  const lines: string[] = [];
  for (let i = 0; i < cleaned.length; i += 64) {
    lines.push(cleaned.slice(i, i + 64));
  }

  const label = kind === 'public' ? 'PUBLIC KEY' : 'PRIVATE KEY';
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`;
}

function assertPemShape(kind: 'public' | 'private', pem: string): void {
  const upper = pem.toUpperCase();
  const hasBegin = upper.includes('-----BEGIN');
  const hasEnd = upper.includes('-----END');
  if (!hasBegin || !hasEnd) {
    // 키 내용 자체는 민감 정보라 출력하지 않음
    throw new Error(
      `Invalid JWT_${kind.toUpperCase()}_KEY format (missing PEM header/footer)`,
    );
  }
}

/**
 * JWT 키 로더
 * 환경변수에서 직접 키를 읽거나, 파일 경로에서 키를 로드
 * Railway 배포 시 환경변수 사용, 로컬 개발 시 파일 사용
 */
export function loadPrivateKey(): string {
  // 환경변수에 직접 키가 있으면 사용
  const keyFromEnv = process.env.JWT_PRIVATE_KEY;
  if (keyFromEnv) {
    let pem = normalizePemFromEnv(keyFromEnv);
    if (!looksLikePem(pem)) {
      // 키 바디만 들어온 경우 자동 감싸기 시도
      pem = wrapAsPem('private', pem);
    }
    assertPemShape('private', pem);
    return pem;
  }

  // 파일에서 로드
  const keyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
  const absolutePath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(process.cwd(), keyPath);
  return fs.readFileSync(absolutePath, 'utf8');
}

export function loadPublicKey(): string {
  // 환경변수에 직접 키가 있으면 사용
  const keyFromEnv = process.env.JWT_PUBLIC_KEY;
  if (keyFromEnv) {
    let pem = normalizePemFromEnv(keyFromEnv);

    // ssh-rsa 포맷은 PEM이 아니라서 명확히 안내
    if (pem.trim().startsWith('ssh-rsa ')) {
      throw new Error(
        'Invalid JWT_PUBLIC_KEY format (expected PEM, not ssh-rsa)',
      );
    }

    if (!looksLikePem(pem)) {
      // 키 바디만 들어온 경우 자동 감싸기 시도
      pem = wrapAsPem('public', pem);
    }
    assertPemShape('public', pem);
    return pem;
  }

  // 파일에서 로드
  const keyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
  const absolutePath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(process.cwd(), keyPath);
  return fs.readFileSync(absolutePath, 'utf8');
}
