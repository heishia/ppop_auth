# @ppop/auth-sdk

JWT verification SDK for PPOP Auth.

## Installation

```bash
npm install @ppop/auth-sdk
```

## Usage

### Basic Token Verification

```typescript
import { verifyToken } from '@ppop/auth-sdk';

const result = await verifyToken(token, {
  jwksUri: 'https://auth-api.yourdomain.com/.well-known/jwks.json',
});

if (result.valid) {
  console.log('User ID:', result.payload.sub);
  console.log('Email:', result.payload.email);
} else {
  console.error('Invalid token:', result.error);
}
```

### Express Middleware

```typescript
import express from 'express';
import { createAuthMiddleware } from '@ppop/auth-sdk';

const app = express();

const authMiddleware = createAuthMiddleware({
  jwksUri: 'https://auth-api.yourdomain.com/.well-known/jwks.json',
});

app.get('/protected', authMiddleware, (req, res) => {
  // req.user contains the JWT payload
  res.json({ userId: req.user.sub });
});
```

### NestJS Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { validateRequest } from '@ppop/auth-sdk';

@Injectable()
export class PpopAuthGuard implements CanActivate {
  private options = {
    jwksUri: process.env.AUTH_JWKS_URI || 'http://localhost:3000/.well-known/jwks.json',
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const result = await validateRequest(request.headers.authorization, this.options);
    
    if (!result.valid) {
      throw new UnauthorizedException(result.error);
    }
    
    request.user = result.user;
    return true;
  }
}
```

## Types

### JwtPayload

```typescript
interface JwtPayload {
  sub: string;    // user_id (UUID)
  email: string;
  type: 'access' | 'refresh';
  iat: number;    // issued at
  exp: number;    // expires at
}
```

### AuthSdkOptions

```typescript
interface AuthSdkOptions {
  jwksUri: string;        // JWKS endpoint URL
  cacheTtl?: number;      // Cache TTL in ms (default: 10 min)
  algorithms?: string[];  // Allowed algorithms (default: ['RS256'])
}
```

## API

### `verifyToken(token, options)`

Verifies a JWT token using JWKS.

- Returns `{ valid: true, payload: JwtPayload }` on success
- Returns `{ valid: false, error: string }` on failure

### `createAuthMiddleware(options)`

Creates an Express middleware for JWT authentication.

### `validateRequest(authHeader, options)`

Validates the Authorization header for NestJS guards.

### `extractToken(authHeader)`

Extracts the Bearer token from an Authorization header.

### `clearCache()`

Clears the JWKS cache (useful for testing).

## License

MIT

