import { IsString, IsIn, ValidateIf } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsIn(['authorization_code', 'refresh_token'])
  grant_type: string;

  // authorization_code 플로우에서 필수
  @ValidateIf(o => o.grant_type === 'authorization_code')
  @IsString()
  code: string;

  @ValidateIf(o => o.grant_type === 'authorization_code')
  @IsString()
  redirect_uri: string;

  // refresh_token 플로우에서 필수
  @ValidateIf(o => o.grant_type === 'refresh_token')
  @IsString()
  refresh_token: string;

  // 양쪽 플로우 모두 필수
  @IsString()
  client_id: string;

  @IsString()
  client_secret: string;
}
