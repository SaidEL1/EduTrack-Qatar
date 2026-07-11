import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CORRELATION_ID_HEADER } from '../../../common/middleware/correlation-id.middleware.js';
import { Public } from '../../security/decorators/public.decorator.js';
import { AuthService } from '../application/auth.service.js';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  TokenResponseDto,
} from '../dto/auth.dto.js';
import { MfaVerifyDto } from '../dto/security.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user — returns tokens or MFA challenge' })
  login(
    @Body() body: LoginDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ): Promise<TokenResponseDto> {
    return this.authService.login(
      {
        email: body.email,
        password: body.password,
        tenantId: body.tenantId,
      },
      correlationId,
    ) as Promise<TokenResponseDto>;
  }

  @Public()
  @Post('mfa/verify')
  @ApiOperation({ summary: 'Complete MFA step-up and issue token pair' })
  verifyMfa(
    @Body() body: MfaVerifyDto,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ): Promise<TokenResponseDto> {
    return this.authService.verifyMfaAndLogin(
      body.challengeToken,
      body.code,
      undefined,
      undefined,
      correlationId,
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  refresh(@Body() body: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refresh(body.refreshToken);
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
