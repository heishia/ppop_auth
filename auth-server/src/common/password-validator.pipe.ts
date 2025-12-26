import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

// 비밀번호 정책 상수
const PASSWORD_POLICY = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 100,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

// 비밀번호 강도 검사 유틸리티
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters`,
    );
  }

  if (password.length > PASSWORD_POLICY.MAX_LENGTH) {
    errors.push(
      `Password must be less than ${PASSWORD_POLICY.MAX_LENGTH} characters`,
    );
  }

  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_POLICY.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_POLICY.REQUIRE_SPECIAL && !/[@$!%*#?&]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (@$!%*#?&)',
    );
  }

  // 연속된 문자 체크 (예: 123, abc)
  if (/(.)\1{2,}/.test(password)) {
    errors.push(
      'Password must not contain more than 2 consecutive identical characters',
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

@Injectable()
export class PasswordValidatorPipe implements PipeTransform {
  transform(value: any) {
    if (value && value.password) {
      const { valid, errors } = validatePasswordStrength(value.password);
      if (!valid) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Password does not meet requirements',
          errors,
        });
      }
    }
    return value;
  }
}
