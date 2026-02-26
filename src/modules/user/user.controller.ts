import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  AdminUpdateUserDto,
  AssignRoleDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '@/dto/user.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ─── Self ────────────────────────────────────────────────────────────────

  /**
   * GET /users/me
   * Returns the authenticated user's profile.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: any) {
    const user = await this.userService.getProfile(req.user.sub);
    return { success: true, user };
  }

  /**
   * POST /users/me/update
   * Update the authenticated user's display name.
   */
  @Post('me/update')
  @HttpCode(HttpStatus.OK)
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = await this.userService.updateProfile(req.user.sub, dto);
    return { success: true, user };
  }

  /**
   * POST /users/me/change-password
   * Change the authenticated user's password.
   */
  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.userService.changePassword(req.user.sub, dto);
    return { success: true, message: 'Password changed successfully' };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  /**
   * GET /users?page=1&limit=20
   * List all users with pagination.
   */
  @Get()
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.userService.listUsers(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return { success: true, ...result };
  }

  /**
   * GET /users/:id
   * Get a single user by ID.
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return { success: true, user };
  }

  /**
   * POST /users/:id/update
   * Admin: update user status (status, is_locked, user_type).
   * @param status: active | inactive | pending | suspended | locked | deleted
   * @param is_locked: true | false
   * @param user_type: KASMA_0 | KASMA_1 | KASMA_2 | KASMA_3 | KASMA_4 | KASMA_5 | TENANT_0 | TENANT_1 | TENANT_2 | TENANT_3 | TENANT_4 | TENANT_5 | GENERAL_0 | GENERAL_1 | GENERAL_2 | GENERAL_3 | GENERAL_4 | GENERAL_5
   */
  @Post(':id/update')
  @HttpCode(HttpStatus.OK)
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const user = await this.userService.adminUpdateUser(id, dto);
    return { success: true, user };
  }

  /**
   * POST /users/:id/delete
   * Admin: permanently delete a user and all their credentials/roles.
   */
  @Post(':id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * GET /users/:id/roles
   * Get all roles assigned to a user.
   */
  @Get(':id/roles')
  async getUserRoles(@Param('id') id: string) {
    const roles = await this.userService.getUserRoles(id);
    return { success: true, roles };
  }

  /**
   * POST /users/:id/roles/assign
   * Assign a role to a user.
   */
  @Post(':id/roles/assign')
  @HttpCode(HttpStatus.CREATED)
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    await this.userService.assignRole(id, dto.role_id);
    return { success: true, message: 'Role assigned successfully' };
  }

  /**
   * POST /users/:id/roles/remove
   * Remove a role from a user.
   */
  @Post(':id/roles/remove')
  @HttpCode(HttpStatus.OK)
  async removeRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    await this.userService.removeRole(id, dto.role_id);
    return { success: true, message: 'Role removed successfully' };
  }
}
