import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import {
  SocialPost,
  PostPrivacy,
  GroupPostApprovalStatus,
} from '@/entities/social/social-post.entity';
import {
  ConnectionType,
  ConnectionStatus,
  SocialConnection,
} from '@/entities/social/social-connection.entity';
import { SocialPostTag, TagType } from '@/entities/mongo/social-post-tag.mongo-entity';

import { normalizeHashtagSlug } from './hashtag.util';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export interface TrendingTopicDto {
  hashtag: string;
  post_count: number;
  last_activity_at?: Date;
}

/** Max hashtag tag documents scanned per trending request (safety cap). */
const TRENDING_TAG_SCAN_CAP = 15_000;

@Injectable()
export class TrendingService {
  constructor(
    @InjectRepository(SocialPostTag, 'mongo')
    private readonly tagRepo: Repository<SocialPostTag>,
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
  ) {}

  async getTrendingTopics(
    ctx: Ctx,
    hours = 24,
    limit = 20,
    maxScan = TRENDING_TAG_SCAN_CAP,
  ): Promise<{ window_hours: number; topics: TrendingTopicDto[] }> {
    const safeHours = Math.min(Math.max(Number(hours) || 24, 1), 168);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const since = new Date(Date.now() - safeHours * 3600_000);
    const scanCap = Math.min(Math.max(Number(maxScan) || TRENDING_TAG_SCAN_CAP, 100), TRENDING_TAG_SCAN_CAP);

    const tags = await this.tagRepo.find({
      where: {
        type: TagType.HASHTAG,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
        created_at: { $gte: since },
      } as Record<string, unknown>,
      take: scanCap,
      order: { created_at: 'DESC' },
    });

    const aggregation = new Map<string, { count: number; lastAt?: Date }>();

    for (const tag of tags) {
      const key = normalizeHashtagSlug(tag.target_id);
      if (!key) continue;

      let row = aggregation.get(key);
      if (!row) {
        row = { count: 0, lastAt: undefined };
        aggregation.set(key, row);
      }
      row.count += 1;

      const t = tag.created_at instanceof Date ? tag.created_at : new Date(tag.created_at);
      if (!row.lastAt || t > row.lastAt) {
        row.lastAt = t;
      }
    }

    const topics = [...aggregation.entries()]
      .map(([hashtag, value]) => ({
        hashtag,
        post_count: value.count,
        last_activity_at: value.lastAt,
      }))
      .sort((a, b) => {
        if (b.post_count !== a.post_count) return b.post_count - a.post_count;
        const ta = a.last_activity_at?.getTime() ?? 0;
        const tb = b.last_activity_at?.getTime() ?? 0;
        return tb - ta;
      })
      .slice(0, safeLimit);

    return { window_hours: safeHours, topics };
  }

  async searchHashtags(
    ctx: Ctx,
    q: string,
    hours = 168,
    limit = 15,
    maxScan = 8000,
  ): Promise<{ query: string; suggestions: TrendingTopicDto[] }> {
    const trimmed = normalizeHashtagSlug(q.replace(/^#+/u, '').slice(0, 120));
    if (!trimmed) {
      return { query: trimmed, suggestions: [] };
    }

    const trending = await this.getTrendingTopics(ctx, Math.min(hours, 168), 100, maxScan);
    const suggestions = trending.topics
      .filter((t) => t.hashtag.startsWith(trimmed) || t.hashtag.includes(trimmed))
      .sort((a, b) => {
        const ap = a.hashtag.startsWith(trimmed) ? 0 : 1;
        const bp = b.hashtag.startsWith(trimmed) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return b.post_count - a.post_count;
      })
      .slice(0, Math.min(limit, 50));

    return { query: trimmed, suggestions };
  }

  async listPostsForHashtag(
    slug: string,
    viewerUserId: string | undefined,
    ctx: Ctx,
    page = 1,
    limit = 20,
    maxTagRows = 6000,
  ): Promise<{ data: SocialPost[]; total: number; page: number; limit: number }> {
    const hashtag = normalizeHashtagSlug(slug);
    if (!hashtag) {
      throw new NotFoundException('Invalid hashtag');
    }

    const safePage = Math.min(Math.max(Number(page) || 1, 1), 10_000);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

    const tagHits = await this.tagRepo.find({
      where: {
        type: TagType.HASHTAG,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
        target_id: hashtag,
      } as Record<string, unknown>,
      take: maxTagRows,
      order: { created_at: 'DESC' },
    });

    const lastActivity = new Map<string, number>();
    for (const h of tagHits) {
      const ts = h.created_at instanceof Date ? h.created_at.getTime() : new Date(h.created_at).getTime();
      const cur = lastActivity.get(h.post_id) ?? 0;
      if (ts > cur) {
        lastActivity.set(h.post_id, ts);
      }
    }

    const rankedIds = [...lastActivity.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]);

    if (rankedIds.length === 0) {
      return { data: [], total: 0, page: safePage, limit: safeLimit };
    }

    const orderedVisible: SocialPost[] = [];
    const seenPost = new Set<string>();
    const chunkSize = 40;

    for (let i = 0; i < rankedIds.length; i += chunkSize) {
      const chunk = rankedIds.slice(i, i + chunkSize);
      const posts = await this.postRepo.find({
        where: { id: In(chunk), is_deleted: false, ...ctx },
      });
      const byId = new Map(posts.map((p) => [p.id, p]));

      for (const id of chunk) {
        if (seenPost.has(id)) continue;
        const post = byId.get(id);
        if (!post || !this.isEligibleForHashtagFeed(post)) continue;

        const visible = viewerUserId
          ? await this.viewerMaySeePost(post, viewerUserId, ctx)
          : post.privacy === PostPrivacy.PUBLIC;

        if (!visible) continue;
        seenPost.add(id);
        orderedVisible.push(post);
      }
    }

    const start = (safePage - 1) * safeLimit;
    return {
      data: orderedVisible.slice(start, start + safeLimit),
      total: orderedVisible.length,
      page: safePage,
      limit: safeLimit,
    };
  }

  private isEligibleForHashtagFeed(post: SocialPost): boolean {
    if (post.group_id) {
      return (
        post.approval_status === GroupPostApprovalStatus.APPROVED ||
        post.approval_status === null
      );
    }
    return true;
  }

  private async viewerMaySeePost(post: SocialPost, viewerId: string, ctx: Ctx): Promise<boolean> {
    if (post.author_id === viewerId) {
      return true;
    }
    if (post.privacy === PostPrivacy.PUBLIC) {
      return true;
    }
    if (post.privacy === PostPrivacy.ONLY_ME) {
      return false;
    }

    if (post.privacy === PostPrivacy.FRIENDS) {
      const isFriend = await this.connectionRepo.findOne({
        where: [
          {
            requester_id: viewerId,
            addressee_id: post.author_id,
            type: ConnectionType.FRIEND,
            status: ConnectionStatus.ACCEPTED,
            ...ctx,
          },
          {
            requester_id: post.author_id,
            addressee_id: viewerId,
            type: ConnectionType.FRIEND,
            status: ConnectionStatus.ACCEPTED,
            ...ctx,
          },
        ],
      });
      return Boolean(isFriend);
    }

    if (post.privacy === PostPrivacy.FOLLOWERS) {
      const isFollower = await this.connectionRepo.findOne({
        where: {
          requester_id: viewerId,
          addressee_id: post.author_id,
          type: ConnectionType.FOLLOW,
          status: ConnectionStatus.ACTIVE,
          ...ctx,
        },
      });
      return Boolean(isFollower);
    }

    return false;
  }
}
