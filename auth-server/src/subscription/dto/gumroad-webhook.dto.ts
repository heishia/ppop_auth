import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

// Gumroad Webhook Payload DTO
// https://help.gumroad.com/article/149-webhooks
export class GumroadWebhookDto {
  @IsString()
  seller_id: string;

  @IsString()
  product_id: string;

  @IsString()
  product_name: string;

  @IsString()
  @IsOptional()
  permalink?: string;

  @IsString()
  @IsOptional()
  product_permalink?: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  order_number?: string;

  @IsString()
  sale_id: string;

  @IsString()
  sale_timestamp: string;

  @IsString()
  @IsOptional()
  purchaser_id?: string;

  @IsString()
  @IsOptional()
  subscription_id?: string;

  @IsString()
  @IsOptional()
  license_key?: string;

  @IsString()
  @IsOptional()
  ip_country?: string;

  @IsString()
  @IsOptional()
  is_recurring_charge?: string;

  @IsString()
  @IsOptional()
  refunded?: string;

  @IsString()
  @IsOptional()
  resource_name?: string;

  @IsString()
  @IsOptional()
  url_params?: string;

  // 커스텀 필드 (Gumroad에서 설정 가능)
  @IsString()
  @IsOptional()
  custom_fields?: string;
}

