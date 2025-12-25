#!/usr/bin/env node
// RSA 키 쌍 생성 스크립트
// 사용법: node scripts/generate-keys.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, '..', 'keys');

// keys 폴더 생성
if (!fs.existsSync(KEYS_DIR)) {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
  console.log('Created keys/ directory');
}

// RSA 키 쌍 생성
console.log('Generating RSA key pair (2048 bits)...');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// 파일 저장
const privateKeyPath = path.join(KEYS_DIR, 'private.pem');
const publicKeyPath = path.join(KEYS_DIR, 'public.pem');

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);

console.log('RSA keys generated successfully!');
console.log(`  Private key: ${privateKeyPath}`);
console.log(`  Public key:  ${publicKeyPath}`);
console.log('');
console.log('WARNING: Never commit these keys to git!');
console.log('         The keys/ folder is already in .gitignore');

