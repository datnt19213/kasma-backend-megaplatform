import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { UserActivityLog, ActivityAction } from '@/entities/mongo/user-activity-log.mongo-entity';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

interface UpdateProfileDto {
  bio?: string;
  location?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  avatar_url?: string;
  avatar_provider?: string;
  cover_url?: string;
  cover_provider?: string;
  interests?: string[];
  is_private?: boolean;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(UserActivityLog, 'mongo')
    private readonly activityLogRepo: Repository<UserActivityLog>,
  ) {}

  async getOrCreateProfile(userId: string, ctx: Ctx): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { user_id: userId, ...ctx } });
    if (!profile) {
      profile = this.profileRepo.create({ user_id: userId, ...ctx });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  async getMyProfile(userId: string, ctx: Ctx): Promise<UserProfile> {
    return this.getOrCreateProfile(userId, ctx);
  }

  async getUserProfile(viewerId: string, targetUserId: string, ctx: Ctx): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({ where: { user_id: targetUserId, ...ctx } });
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ người dùng.');

    // Log view activity for Discovery engine
    if (viewerId !== targetUserId) {
      const log = this.activityLogRepo.create({
        actor_id: viewerId,
        target_id: targetUserId,
        action: ActivityAction.VIEWED_PROFILE,
        ...ctx,
      });
      await this.activityLogRepo.save(log).catch(() => null); // Non-blocking
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ctx: Ctx): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { user_id: userId, ...ctx } });
    if (!profile) {
      profile = this.profileRepo.create({ user_id: userId, ...ctx });
    }

    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }
}
