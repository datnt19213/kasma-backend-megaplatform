import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { SocialConnection, ConnectionType, ConnectionStatus } from '@/entities/social/social-connection.entity';
import { UserActivityLog, ActivityAction } from '@/entities/mongo/user-activity-log.mongo-entity';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
    @InjectRepository(UserActivityLog, 'mongo')
    private readonly activityLogRepo: Repository<UserActivityLog>,
  ) {}

  async getSuggestions(userId: string, ctx: Ctx, limit = 10) {
    // 1. Get existing connections to exclude
    const existingConnections = await this.connectionRepo.find({
      where: [
        { requester_id: userId, ...ctx },
        { addressee_id: userId, ...ctx },
      ],
      select: ['requester_id', 'addressee_id', 'type'],
    });

    const excludedIds = new Set<string>([userId]);
    for (const conn of existingConnections) {
      // Exclude blocked, already followed or friended users
      excludedIds.add(conn.requester_id);
      excludedIds.add(conn.addressee_id);
    }

    // 2. Get current user's interests for matching
    const myProfile = await this.profileRepo.findOne({ where: { user_id: userId, ...ctx } });
    const myInterests = myProfile?.interests ?? [];

    // 3. Get recent activity to find who user interacted with (FOAF: Friend-of-a-Friend)
    const recentActivity = await this.activityLogRepo.find({
      where: { actor_id: userId, action: ActivityAction.VIEWED_PROFILE } as any,
      order: { created_at: 'DESC' } as any,
      take: 50,
    });
    const recentlyViewedIds = recentActivity.map((a) => a.target_id);

    // 4. Build suggestion candidates
    const candidates = await this.profileRepo.find({
      where: {
        ...ctx,
        is_private: false,
      },
      take: limit * 5, // Fetch more to score & filter
    });

    // 5. Score candidates
    const scored = candidates
      .filter((p) => !excludedIds.has(p.user_id))
      .map((profile) => {
        let score = 0;

        // Shared interests boost
        const sharedInterests = (profile.interests ?? []).filter((i) => myInterests.includes(i));
        score += sharedInterests.length * 10;

        // Follower count popularity boost (capped)
        score += Math.min(profile.follower_count / 10, 20);

        // Recently viewed but not yet connected
        if (recentlyViewedIds.includes(profile.user_id)) score += 5;

        return { profile, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.profile);

    return { suggestions: scored, total: scored.length };
  }
}
