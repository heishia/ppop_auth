import { IsString, IsIn } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsIn(['authorization_code'])
  grant_type: string;

  @IsString()
  code: string;

  @IsString()
  client_id: string;

  @IsString()
  client_secret: string;

  @IsString()
  redirect_uri: string;
}

