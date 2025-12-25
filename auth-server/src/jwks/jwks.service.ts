import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { loadPublicKey } from '../common/key-loader';

// JWKS (JSON Web Key Set) 인터페이스
export interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface JWKS {
  keys: JWK[];
}

@Injectable()
export class JwksService {
  private jwks: JWKS;

  constructor() {
    this.jwks = this.generateJwks();
  }

  // JWKS 반환
  getJwks(): JWKS {
    return this.jwks;
  }

  // PEM 공개키에서 JWKS 생성
  private generateJwks(): JWKS {
    // 공개키 로드 (환경변수 또는 파일)
    const publicKeyPem = loadPublicKey();

    // PEM -> KeyObject
    const publicKey = crypto.createPublicKey(publicKeyPem);

    // KeyObject -> JWK
    const jwk = publicKey.export({ format: 'jwk' }) as crypto.JsonWebKey;

    // Key ID 생성 (공개키의 SHA-256 해시)
    const kid = crypto
      .createHash('sha256')
      .update(publicKeyPem)
      .digest('hex')
      .substring(0, 16);

    return {
      keys: [
        {
          kty: 'RSA',
          kid,
          use: 'sig',
          alg: 'RS256',
          n: jwk.n as string,
          e: jwk.e as string,
        },
      ],
    };
  }
}
