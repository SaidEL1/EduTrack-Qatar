import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { CORRELATION_ID_HEADER } from '../../../common/middleware/correlation-id.middleware.js';
import { Public } from '../../security/decorators/public.decorator.js';
import { AuthService } from '../application/auth.service.js';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  TokenResponseDto,
} from '../dto/auth.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and issue token pair (TDR-011)' })
  login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ): Promise<TokenResponseDto> {
    return this.authService.login(
      {
        email: body.email,
        password: body.password,
        tenantId: body.tenantId,
        ...(request.ip !== undefined ? { ipAddress: request.ip } : {}),
        ...(request.headers['user-agent'] !== undefined
          ? { userAgent: request.headers['user-agent'] }
          : {}),
      },
      correlationId,
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  refresh(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<TokenResponseDto> {
    return this.authService.refresh(
      body.refreshToken,
      request.ip,
      request.headers['user-agent'],
    );
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token session' })
  logout(
    @Body() body: LogoutDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ): Promise<{ success: true }> {
    return this.authService
      .logout(body.refreshToken, correlationId)
      .then(() => ({ success: true }));
  }
}
