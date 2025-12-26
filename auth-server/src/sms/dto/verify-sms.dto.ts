import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

// SMS 인증 확인 DTO
export class VerifySmsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^01[0-9]{8,9}$/, {
    message: 'Invalid phone number format. Use 01012345678 format.',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'Verification code must be numeric' })
  code: string;
}
