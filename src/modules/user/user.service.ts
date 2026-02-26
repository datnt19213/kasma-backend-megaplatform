import * as bcrypt from 'bcrypt';
import { UserProfile } from 'src/mongo-entities/user-profile.mongo-entity';
import {
  DeepPartial,
  Repository,
} from 'typeorm';

import { UserType } from '@/config/apps';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '@/dto/user.dto';
import { Role } from '@/entities/role.entity';
import { UserCredential } from '@/entities/user-credential.entity';
import { UserRole } from '@/entities/user-role.entity';
import { User } from '@/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'postgres')
    private userRepository: Repository<User>,

    @InjectRepository(UserCredential, 'postgres')
    private credentialRepository: Repository<UserCredential>,

    @InjectRepository(UserRole, 'postgres')
    private userRoleRepository: Repository<UserRole>,

    @InjectRepository(Role, 'postgres')
    private roleRepository: Repository<Role>,

    @InjectRepository(UserProfile, 'mongo')
    private userProfileRepository: Repository<UserProfile>,
  ) { }

  // ─── Self ────────────────────────────────────────────────────────────────

  private async mergeProfile(user: User): Promise<any> {
    const profile = await this.userProfileRepository.findOne({
      where: { user_id: user.id } as any,
    });
    return {
      ...user,
      profile: profile || null,
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } as any });
    if (!user) throw new NotFoundException('User not found');
    return this.mergeProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } as any });
    if (!user) throw new NotFoundException('User not found');

    // 1. Update Core Postgres data
    if (dto.display_name !== undefined) {
      user.display_name = dto.display_name;
      await this.userRepository.save(user);
    }

    // 2. Update Extended Mongo data
    const mongoFields = [
      'bio', 'avatar_url', 'background_url', 'first_name', 'last_name',
      'phone', 'address', 'city', 'state', 'zip', 'country',
      'language', 'timezone', 'currency', 'date_of_birth', 'gender',
      'website', 'social_links', 'notification_preferences',
      'privacy_settings', 'security_settings', 'subscription_status',
      'subscription_plan', 'subscription_start_date', 'subscription_end_date',
      'subscription_trial_end_date', 'subscription_cancel_at_period_end',
      'subscription_cancel_at', 'subscription_canceled_at',
      'subscription_current_period_start', 'subscription_current_period_end'
    ];

    const hasMongoUpdates = mongoFields.some(field => dto[field] !== undefined);

    if (hasMongoUpdates) {
      let profile = await this.userProfileRepository.findOne({ where: { user_id: userId } as any });
      if (!profile) {
        profile = this.userProfileRepository.create({ user_id: userId });
      }

      // Map fields from DTO to profile
      mongoFields.forEach(field => {
        if (dto[field] !== undefined) {
          profile[field] = dto[field];
        }
      });

      await this.userProfileRepository.save(profile);
    }

    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId, provider: 'local', is_active: true } as any,
    });
    if (!credential) throw new NotFoundException('Credential not found');

    const match = await bcrypt.compare(dto.current_password, credential.password);
    if (!match) throw new BadRequestException('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    credential.password = await bcrypt.hash(dto.new_password, salt);
    await this.credentialRepository.save(credential);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  async listUsers(page = 1, limit = 20): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      order: { created_at: 'DESC' } as any,
      skip: (page - 1) * limit,
      take: limit,
    });

    const mergedData = await Promise.all(data.map((user) => this.mergeProfile(user)));

    return { data: mergedData, total, page, limit };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');
    return this.mergeProfile(user);
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');

    if (dto.status !== undefined) user.status = dto.status;
    if (dto.is_locked !== undefined) user.is_locked = dto.is_locked;
    if (dto.user_type !== undefined) user.user_type = dto.user_type as UserType;
    await this.userRepository.save(user);

    return this.getProfile(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');

    await this.credentialRepository.delete({ user_id: id } as any);
    await this.userRoleRepository.delete({ user_id: id } as any);
    await this.userProfileRepository.delete({ user_id: id } as any);
    await this.userRepository.remove(user);
  }

  // ─── Roles ───────────────────────────────────────────────────────────────

  async getUserRoles(userId: string): Promise<Role[]> {
    await this.getUserById(userId); // ensure user exists
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId } as any,
    });
    if (!userRoles.length) return [];

    const roleIds = userRoles.map((ur) => ur.role_id);
    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.id IN (:...ids)', { ids: roleIds })
      .getMany();
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.getUserById(userId);

    const role = await this.roleRepository.findOne({ where: { id: roleId } as any });
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId } as any,
    });
    if (existing) throw new ConflictException('Role already assigned');

    const ur = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
    } as DeepPartial<UserRole>);
    await this.userRoleRepository.save(ur as UserRole);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.getUserById(userId);
    const result = await this.userRoleRepository.delete({
      user_id: userId,
      role_id: roleId,
    } as any);
    if (!result.affected) throw new NotFoundException('Role assignment not found');
  }
}
