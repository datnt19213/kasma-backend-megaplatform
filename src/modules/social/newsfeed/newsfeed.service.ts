import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { SocialPost, PostPrivacy } from '@/entities/social/social-post.entity';
import { SocialConnection, ConnectionType, ConnectionStatus } from '@/entities/social/social-connection.entity';
import { SocialPostMedia } from '@/entities/mongo/social-post-media.mongo-entity';
import { SocialPostTag } from '@/entities/mongo/social-post-tag.mongo-entity';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

@Injectable()
export class NewsfeedService {
  constructor(
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
    @InjectRepository(SocialPostMedia, 'mongo')
    private readonly postMediaRepo: Repository<SocialPostMedia>,
    @InjectRepository(SocialPostTag, 'mongo')
    private readonly postTagRepo: Repository<SocialPostTag>,
  ) {}

  async getNewsfeed(userId: string, ctx: Ctx, page = 1, limit = 20) {
    // 1. Get user's connections (Friends and Following)
    const connections = await this.connectionRepo.find({
      where: [
        // Following
        { requester_id: userId, type: ConnectionType.FOLLOW, status: ConnectionStatus.ACTIVE, ...ctx },
        // Friends (both directions)
        { requester_id: userId, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
        { addressee_id: userId, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
      ],
    });

    const friendsIds = new Set<string>();
    const followingIds = new Set<string>();

    for (const conn of connections) {
      const targetId = conn.requester_id === userId ? conn.addressee_id : conn.requester_id;
      if (conn.type === ConnectionType.FRIEND) {
        friendsIds.add(targetId);
      }
      if (conn.type === ConnectionType.FOLLOW) {
        followingIds.add(targetId);
      }
    }

    const friendsArr = Array.from(friendsIds);
    const followingArr = Array.from(followingIds);
    
    // Also include own posts
    const authorIds = Array.from(new Set([userId, ...friendsArr, ...followingArr]));

    // 2. Query posts respecting privacy
    const query = this.postRepo.createQueryBuilder('post')
      .where('post.app_key = :appKey', { appKey: ctx.app_key })
      .andWhere('post.tenant_key = :tenantKey', { tenantKey: ctx.tenant_key })
      .andWhere('post.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('post.author_id IN (:...authorIds)', { authorIds })
      .andWhere(new Brackets((qb) => {
        // Own posts
        qb.where('post.author_id = :userId', { userId });
        
        // Public posts
        qb.orWhere('post.privacy = :public', { public: PostPrivacy.PUBLIC });
        
        // Friends posts
        if (friendsArr.length > 0) {
          qb.orWhere(new Brackets((sqb) => {
            sqb.where('post.privacy = :friends', { friends: PostPrivacy.FRIENDS })
               .andWhere('post.author_id IN (:...friendsArr)', { friendsArr });
          }));
        }

        // Followers posts
        if (followingArr.length > 0) {
          qb.orWhere(new Brackets((sqb) => {
            sqb.where('post.privacy = :followers', { followers: PostPrivacy.FOLLOWERS })
               .andWhere('post.author_id IN (:...followingArr)', { followingArr });
          }));
        }
      }))
      .orderBy('post.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await query.getManyAndCount();

    // 3. Attach media and tags
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const [media, tags] = await Promise.all([
        this.postMediaRepo.find({ where: { post_id: { $in: postIds }, ...ctx } as any }),
        this.postTagRepo.find({ where: { post_id: { $in: postIds }, ...ctx } as any }),
      ]);

      for (const post of posts) {
        (post as any).media = media.filter(m => m.post_id === post.id).sort((a, b) => a.order_index - b.order_index);
        (post as any).tags = tags.filter(t => t.post_id === post.id);
      }
    }

    return { data: posts, total, page, limit };
  }
}
