import {
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;
}

export class UpsertSchoolDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class CreateCampusDto {
  @IsString()
  schoolId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  code!: string;
}

export class AcademicTermDto {
  @IsString()
  name!: string;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class CreateAcademicYearDto {
  @IsString()
  name!: string;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  terms?: AcademicTermDto[];
}

export class UpsertSettingDto {
  @IsString()
  key!: string;

  value!: Record<string, unknown>;
}

export class UpsertFeatureFlagDto {
  @IsString()
  key!: string;

  @IsBoolean()
  enabled!: boolean;
}
