import * as fs from 'fs';
import * as path from 'path';

/**
 * JWT 키 로더
 * 환경변수에서 직접 키를 읽거나, 파일 경로에서 키를 로드
 * Railway 배포 시 환경변수 사용, 로컬 개발 시 파일 사용
 */
export function loadPrivateKey(): string {
  // 환경변수에 직접 키가 있으면 사용
  const keyFromEnv = process.env.JWT_PRIVATE_KEY;
  if (keyFromEnv) {
    // 환경변수에서는 \n이 문자열로 저장되므로 실제 줄바꿈으로 변환
    return keyFromEnv.replace(/\\n/g, '\n');
  }

  // 파일에서 로드
  const keyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
  const absolutePath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(process.cwd(), '..', keyPath);
  return fs.readFileSync(absolutePath, 'utf8');
}

export function loadPublicKey(): string {
  // 환경변수에 직접 키가 있으면 사용
  const keyFromEnv = process.env.JWT_PUBLIC_KEY;
  if (keyFromEnv) {
    // 환경변수에서는 \n이 문자열로 저장되므로 실제 줄바꿈으로 변환
    return keyFromEnv.replace(/\\n/g, '\n');
  }

  // 파일에서 로드
  const keyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
  const absolutePath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(process.cwd(), '..', keyPath);
  return fs.readFileSync(absolutePath, 'utf8');
}

