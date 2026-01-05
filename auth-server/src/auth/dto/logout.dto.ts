import { IsOptional, IsString } from 'class-validator';

export class LogoutQueryDto {
  @IsOptional()
  @IsString()
  returnUrl?: string;
}

