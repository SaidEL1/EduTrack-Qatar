import { ApiProperty } from '@nestjs/swagger';
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

export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';
}
