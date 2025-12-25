import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { AuthorizeDto, TokenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('oauth')
export class OAuthController {
  private authClientUrl: string;

  constructor(
    private oauthService: OAuthService,
    private configService: ConfigService,
  ) {
    this.authClientUrl =
      this.configService.get<string>('AUTH_CLIENT_URL') ||
      'http://localhost:3001';
  }

  // GET /oauth/authorize
  // SaaS가 인증 요청 시 호출
  // 로그인 안됨 -> 로그인 페이지로 redirect
  // 로그인 됨 -> code 발급 후 redirect_uri로 redirect
  @Get('authorize')
  async authorize(
    @Query() dto: AuthorizeDto,
    @Res() res: { redirect: (url: string) => void },
  ) {
    try {
      // Client 검증
      await this.oauthService.validateClient(dto.client_id, dto.redirect_uri);

      // 로그인 페이지로 redirect (OAuth 파라미터 전달)
      const params = new URLSearchParams({
        client_id: dto.client_id,
        redirect_uri: dto.redirect_uri,
        response_type: dto.response_type,
        ...(dto.state && { state: dto.state }),
      });

      res.redirect(`${this.authClientUrl}/login?${params.toString()}`);
    } catch (error: unknown) {
      // 에러 시 redirect_uri로 에러 전달
      const errorParams = new URLSearchParams({
        error: 'invalid_request',
        error_description:
          error instanceof Error ? error.message : 'Unknown error',
        ...(dto.state && { state: dto.state }),
      });

      res.redirect(`${dto.redirect_uri}?${errorParams.toString()}`);
    }
  }

  // GET /oauth/authorize/callback
  // 로그인 성공 후 Auth Client에서 호출 (인증된 사용자)
  @UseGuards(JwtAuthGuard)
  @Get('authorize/callback')
  async authorizeCallback(
    @Request() req: { user: { id: string } },
    @Query() dto: AuthorizeDto,
    @Res() res: { redirect: (url: string) => void },
  ) {
    try {
      // Client 검증
      await this.oauthService.validateClient(dto.client_id, dto.redirect_uri);

      // Authorization Code 생성
      const code = await this.oauthService.createAuthorizationCode(
        req.user.id,
        dto.client_id,
        dto.redirect_uri,
        dto.state,
      );

      // redirect_uri로 code 전달
      const params = new URLSearchParams({
        code,
        ...(dto.state && { state: dto.state }),
      });

      res.redirect(`${dto.redirect_uri}?${params.toString()}`);
    } catch (error: unknown) {
      const errorParams = new URLSearchParams({
        error: 'server_error',
        error_description:
          error instanceof Error ? error.message : 'Unknown error',
        ...(dto.state && { state: dto.state }),
      });

      res.redirect(`${dto.redirect_uri}?${errorParams.toString()}`);
    }
  }

  // POST /oauth/token
  // SaaS 서버가 code를 token으로 교환
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async token(@Body() dto: TokenDto) {
    return this.oauthService.exchangeCodeForToken(
      dto.code,
      dto.client_id,
      dto.client_secret,
      dto.redirect_uri,
    );
  }
}
