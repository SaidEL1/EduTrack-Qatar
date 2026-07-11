import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@school.qa' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tenantId!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  challengeToken!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  code!: string;
}

export class TokenResponseDto {
  @ApiPropertyOptional()
  accessToken?: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiPropertyOptional({ example: 'Bearer' })
  tokenType?: 'Bearer';

  @ApiPropertyOptional()
  mfaRequired?: boolean;

  @ApiPropertyOptional()
  challengeToken?: string;
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;
}

export class PasswordResetRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  newPassword!: string;
}

export class VerifyEmailConfirmDto {
  @ApiProperty()
  @IsString()
  token!: string;
}

export class MfaConfirmDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  code!: string;
}

export class MfaDisableDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  code!: string;
}

export class CreateInvitationDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  roleId?: string;
}
