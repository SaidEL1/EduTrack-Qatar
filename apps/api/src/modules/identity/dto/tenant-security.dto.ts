import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateTenantSecurityPolicyDto {
  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(12)
  @Max(128)
  passwordMinLength?: number;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  passwordExpiryDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  passwordHistoryCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxActiveSessions?: number;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(10_080)
  sessionIdleTimeoutMinutes?: number;
}
