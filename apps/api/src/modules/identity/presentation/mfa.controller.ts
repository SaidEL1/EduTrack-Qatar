import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../security/decorators/current-user.decorator.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import type { AuthenticatedUser } from '../../security/types/authenticated-user.js';
import { MfaService } from '../application/mfa.service.js';
import { MfaConfirmDto, MfaDisableDto } from '../dto/security.dto.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity — MFA')
@ApiBearerAuth('access-token')
@Controller('identity/mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('enroll')
  @RequirePermission(IDENTITY_PERMISSIONS.MFA_MANAGE)
  @ApiOperation({
    summary: 'Start TOTP enrollment — returns secret and otpauth URL for QR',
  })
  enroll(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.startEnrollment(user.userId, user.email);
  }

  @Post('confirm')
  @RequirePermission(IDENTITY_PERMISSIONS.MFA_MANAGE)
  @ApiOperation({ summary: 'Confirm TOTP enrollment with verification code' })
  confirm(@CurrentUser() user: AuthenticatedUser, @Body() body: MfaConfirmDto) {
    return this.mfaService.confirmEnrollment(user.userId, body.code);
  }

  @Delete()
  @RequirePermission(IDENTITY_PERMISSIONS.MFA_MANAGE)
  @ApiOperation({ summary: 'Disable MFA' })
  disable(@CurrentUser() user: AuthenticatedUser, @Body() body: MfaDisableDto) {
    return this.mfaService
      .disable(user.userId, body.code)
      .then(() => ({ success: true }));
  }

  @Post('backup-codes/regenerate')
  @RequirePermission(IDENTITY_PERMISSIONS.MFA_MANAGE)
  @ApiOperation({ summary: 'Regenerate backup recovery codes' })
  regenerateBackupCodes(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: MfaConfirmDto,
  ) {
    return this.mfaService.regenerateBackupCodes(user.userId, body.code);
  }
}
