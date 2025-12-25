import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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

  constructor(private configService: ConfigService) {
    this.jwks = this.generateJwks();
  }

  // JWKS 반환
  getJwks(): JWKS {
    return this.jwks;
  }

  // PEM 공개키에서 JWKS 생성
  private generateJwks(): JWKS {
    const publicKeyPath =
      this.configService.get<string>('JWT_PUBLIC_KEY_PATH') ||
      './keys/public.pem';
    const absolutePath = path.isAbsolute(publicKeyPath)
      ? publicKeyPath
      : path.join(process.cwd(), '..', publicKeyPath);
    const publicKeyPem = fs.readFileSync(absolutePath, 'utf8');

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
