import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsUUID,
} from 'class-validator';

// 확장된 회원가입 DTO (피그마 프론트엔드 플로우 대응)
export class ExtendedRegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100, { message: 'Password is too long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
    message: 'Password must contain letters, numbers, and special characters',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name is too long' })
  name: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Birthdate must be 6 digits (YYMMDD)' })
  birthdate: string;

  // 전화번호 (선택)
  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, { message: 'Invalid phone number format' })
  phone?: string;

  // SMS 인증 ID (전화번호 인증을 완료한 경우)
  @IsOptional()
  @IsUUID('4', { message: 'Invalid verification ID' })
  smsVerificationId?: string;
}
