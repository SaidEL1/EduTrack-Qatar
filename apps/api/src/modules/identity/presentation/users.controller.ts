import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CORRELATION_ID_HEADER } from '../../../common/middleware/correlation-id.middleware.js';
import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { CurrentUser } from '../../security/decorators/current-user.decorator.js';
import { RequirePermission } from '../../security/decorators/require-permission.decorator.js';
import type { AuthenticatedUser } from '../../security/types/authenticated-user.js';
import { UserManagementService } from '../application/user-management.service.js';
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from '../dto/user.dto.js';
import { IDENTITY_PERMISSIONS } from '../permissions/identity.permissions.js';

@ApiTags('Identity')
@ApiBearerAuth('access-token')
@Controller('identity/users')
export class UsersController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  @RequirePermission(IDENTITY_PERMISSIONS.USER_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  @ApiOperation({ summary: 'Create user with organization membership' })
  createUser(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Body() body: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.createUser(
      {
        tenantId,
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
        ...(body.roleId !== undefined ? { roleId: body.roleId } : {}),
        actorId: actor.userId,
      },
      correlationId,
    );
  }

  @Get()
  @RequirePermission(IDENTITY_PERMISSIONS.USER_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  listUsers(@Headers(TENANT_ID_HEADER) tenantId: string) {
    return this.userManagementService.listUsers(tenantId);
  }

  @Get(':userId')
  @RequirePermission(IDENTITY_PERMISSIONS.USER_READ)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  getUser(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.userManagementService.getUser(tenantId, userId);
  }

  @Patch(':userId')
  @RequirePermission(IDENTITY_PERMISSIONS.USER_WRITE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  updateUser(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.updateUser(
      {
        tenantId,
        userId,
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
        ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
        ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
        actorId: actor.userId,
      },
      correlationId,
    );
  }

  @Post(':userId/deactivate')
  @RequirePermission(IDENTITY_PERMISSIONS.USER_DEACTIVATE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  deactivateUser(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.deactivateUser(
      tenantId,
      userId,
      actor.userId,
      correlationId,
    );
  }

  @Post(':userId/reactivate')
  @RequirePermission(IDENTITY_PERMISSIONS.USER_DEACTIVATE)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  reactivateUser(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.reactivateUser(
      tenantId,
      userId,
      actor.userId,
      correlationId,
    );
  }

  @Post(':userId/roles')
  @RequirePermission(IDENTITY_PERMISSIONS.ROLE_ASSIGN)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  assignRole(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
    @Body() body: AssignRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.assignRole(
      tenantId,
      userId,
      body.roleId,
      actor.userId,
      correlationId,
    );
  }

  @Delete(':userId/roles/:roleId')
  @RequirePermission(IDENTITY_PERMISSIONS.ROLE_ASSIGN)
  @ApiHeader({ name: TENANT_ID_HEADER, required: true })
  removeRole(
    @Headers(TENANT_ID_HEADER) tenantId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Headers(CORRELATION_ID_HEADER) correlationId?: string,
  ) {
    return this.userManagementService.removeRole(
      tenantId,
      userId,
      roleId,
      actor.userId,
      correlationId,
    );
  }
}
