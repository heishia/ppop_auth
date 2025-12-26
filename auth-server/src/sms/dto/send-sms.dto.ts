import { IsString, IsNotEmpty, Matches } from 'class-validator';

// SMS 발송 요청 DTO
export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^01[0-9]{8,9}$/, {
    message: 'Invalid phone number format. Use 01012345678 format.',
  })
  phone: string;
}
