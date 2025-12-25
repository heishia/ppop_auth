import { IsString, IsOptional, IsIn } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  client_id: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  @IsIn(['code'])
  response_type: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  scope?: string;
}

