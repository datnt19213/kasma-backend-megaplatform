import type { Response } from 'express';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  GetLoginLogsDto,
  LoginDto,
  RegisterDto,
} from '@/dto/auth.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const cookieConfig = this.configService.get('auth.cookie');

    // Access token cookie (httpOnly, secure in prod)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: cookieConfig?.secure,
      sameSite: cookieConfig?.sameSite,
      path: cookieConfig?.path,
      maxAge: cookieConfig?.accessTokenMaxAge,
    });

    // Refresh token cookie (httpOnly, secure in prod)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: cookieConfig?.secure,
      sameSite: cookieConfig?.sameSite,
      path: cookieConfig?.path,
      maxAge: cookieConfig?.refreshTokenMaxAge,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.authService.login(dto, ipAddress);

    // Set httpOnly cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Return only necessary user info (no sensitive data)
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.authService.register(dto, ipAddress);

    // Set cookies if auto-login
    if (result.accessToken && result.refreshToken) {
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    return {
      success: true,
      user: result.user,
      autoLoggedIn: !!result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token provided',
      };
    }

    const result = await this.authService.refreshTokens(refreshToken, ipAddress);

    // Update cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
    const userId = req.user.sub;

    if (accessToken && refreshToken) {
      await this.authService.logout(accessToken, refreshToken, userId);
    }

    this.clearAuthCookies(res);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;

    await this.authService.logoutAll(userId);
    this.clearAuthCookies(res);

    return {
      success: true,
      message: 'Logged out from all sessions',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return {
      success: true,
      user: {
        id: req.user.sub,
        email: req.user.email,
        user_type: req.user.user_type,
      },
    };
  }

  @Get('logs/login')
  @UseGuards(JwtAuthGuard)
  async getLoginLogs(@Query() dto: GetLoginLogsDto) {
    const result = await this.authService.getLoginLogs({
      page: dto.page || 1,
      limit: dto.limit || 20,
      user_id: dto.user_id,
      action: dto.action,
    });

    return {
      success: true,
      ...result,
    };
  }
}
