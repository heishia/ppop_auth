import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GlobalAdminGuard } from '../auth/guards/global-admin.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * 모든 관리자 조회
   * 관리자만 접근 가능
   */
  @Get('admins')
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async getAdmins() {
    const admins = await this.usersService.findAllAdmins();
    return {
      count: admins.length,
      admins,
    };
  }

  /**
   * 관리자 권한 부여/제거
   * 관리자만 접근 가능
   */
  @Patch(':userId/admin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, GlobalAdminGuard)
  async setAdminRole(
    @Param('userId') userId: string,
    @Body('isAdmin') isAdmin: boolean,
  ) {
    const user = await this.usersService.setGlobalAdmin(userId, isAdmin);
    return {
      message: isAdmin
        ? 'Global admin role granted'
        : 'Global admin role revoked',
      user,
    };
  }
}

