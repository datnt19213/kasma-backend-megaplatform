import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SocialPost, PostPrivacy, PostType } from '@/entities/social/social-post.entity';
import { SocialPostMedia, MediaType } from '@/entities/mongo/social-post-media.mongo-entity';
import { SocialPostTag, TagType } from '@/entities/mongo/social-post-tag.mongo-entity';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { User } from '@/entities/user.entity';
import { SocialConnection, ConnectionType, ConnectionStatus } from '@/entities/social/social-connection.entity';
import { NoticeService } from '../notice/notice.service';
import { HashtagIndexService } from '../trending/hashtag-index.service';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export class CreatePostDto {
  content?: string;
  type?: PostType;
  privacy?: PostPrivacy;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  link_url?: string;
  link_preview_image?: string;
  link_preview_title?: string;
  media?: Array<{ url: string; type: MediaType; provider?: string }>;
  tags?: Array<{ target_id: string; target_name: string; type: TagType }>;
}

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
    @InjectRepository(SocialPostMedia, 'mongo')
    private readonly postMediaRepo: Repository<SocialPostMedia>,
    @InjectRepository(SocialPostTag, 'mongo')
    private readonly postTagRepo: Repository<SocialPostTag>,
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(User, 'postgres')
    private readonly userRepo: Repository<User>,
    private readonly noticeService: NoticeService,
    private readonly hashtagIndex: HashtagIndexService,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto, ctx: Ctx) {
    const post = this.postRepo.create({
      author_id: authorId,
      content: dto.content,
      type: dto.type || PostType.TEXT,
      privacy: dto.privacy || PostPrivacy.PUBLIC,
      location_name: dto.location_name,
      latitude: dto.latitude,
      longitude: dto.longitude,
      link_url: dto.link_url,
      link_preview_image: dto.link_preview_image,
      link_preview_title: dto.link_preview_title,
      ...ctx,
    });

    const savedPost = await this.postRepo.save(post);

    if (dto.media && dto.media.length > 0) {
      const mediaDocs = dto.media.map((m, index) =>
        this.postMediaRepo.create({
          post_id: savedPost.id,
          url: m.url,
          type: m.type,
          provider: m.provider,
          order_index: index,
          ...ctx,
        }),
      );
      await this.postMediaRepo.save(mediaDocs);
    }

    if (dto.tags && dto.tags.length > 0) {
      const userLocationTags = dto.tags.filter(
        (t) => t.type === TagType.USER || t.type === TagType.LOCATION,
      );
      if (userLocationTags.length > 0) {
        const tagDocs = userLocationTags.map((t) =>
          this.postTagRepo.create({
            post_id: savedPost.id,
            target_id: t.target_id,
            target_name: t.target_name,
            type: t.type,
            ...ctx,
          }),
        );
        await this.postTagRepo.save(tagDocs);

        for (const tag of userLocationTags) {
          if (tag.type === TagType.USER) {
            await this.noticeService.notifyTag(
              ctx,
              tag.target_id,
              authorId,
              'POST',
              savedPost.id,
            );
          }
        }
      }
    }

    await this.hashtagIndex.reindexPostHashtags(savedPost.id, savedPost.content, ctx, dto.tags);

    return savedPost;
  }

  async getPostById(postId: string, viewerId: string, ctx: Ctx) {
    const post = await this.postRepo.findOne({ where: { id: postId, is_deleted: false, ...ctx } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.author_id !== viewerId) {
      if (post.privacy === PostPrivacy.ONLY_ME) {
        throw new ForbiddenException('You do not have permission to view this post');
      }

      if (post.privacy === PostPrivacy.FRIENDS) {
        const isFriend = await this.connectionRepo.findOne({
          where: [
            { requester_id: viewerId, addressee_id: post.author_id, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
            { requester_id: post.author_id, addressee_id: viewerId, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
          ],
        });
        if (!isFriend) throw new ForbiddenException('This post is visible to friends only');
      }

      if (post.privacy === PostPrivacy.FOLLOWERS) {
        const isFollower = await this.connectionRepo.findOne({
          where: { requester_id: viewerId, addressee_id: post.author_id, type: ConnectionType.FOLLOW, status: ConnectionStatus.ACTIVE, ...ctx },
        });
        if (!isFollower) throw new ForbiddenException('This post is visible to followers only');
      }
    }

    const [media, tags] = await Promise.all([
      this.postMediaRepo.find({ where: { post_id: postId, ...ctx }, order: { order_index: 'ASC' } as any }),
      this.postTagRepo.find({ where: { post_id: postId, ...ctx } }),
    ]);

    // Populate User tags with profile data
    let populatedTags = tags;
    const userTagIds = tags.filter(t => t.type === TagType.USER).map(t => t.target_id);
    if (userTagIds.length > 0) {
      const profiles = await this.profileRepo.find({ where: { user_id: In(userTagIds), ...ctx } });
      const users = await this.userRepo.find({ where: { id: In(userTagIds), ...ctx } });
      populatedTags = tags.map(t => {
        if (t.type === TagType.USER) {
          const profile = profiles.find(p => p.user_id === t.target_id);
          const user = users.find(u => u.id === t.target_id);
          if (profile || user) {
            return {
              ...t,
              user: {
                id: t.target_id,
                name: user?.display_name || '',
                username: user?.email || '',
                avatar: profile?.avatar_url || '',
              }
            };
          }
        }
        return t;
      });
    }

    // Increment view count non-blocking
    this.postRepo.increment({ id: postId }, 'view_count', 1).catch(() => null);

    return { ...post, media, tags: populatedTags };
  }

  async deletePost(postId: string, authorId: string, ctx: Ctx) {
    const post = await this.postRepo.findOne({ where: { id: postId, author_id: authorId, ...ctx } });
    if (!post) throw new NotFoundException('Post not found or unauthorized');

    post.is_deleted = true;
    await this.postRepo.save(post);
    
    // We could soft-delete media and tags in Mongo, but for now we keep them or hard delete
    await this.postMediaRepo.delete({ post_id: postId, ...ctx } as any);
    await this.postTagRepo.delete({ post_id: postId, ...ctx } as any);

    return { success: true };
  }

  async repost(postId: string, authorId: string, ctx: Ctx) {
    const originalPost = await this.postRepo.findOne({ where: { id: postId, is_deleted: false, ...ctx } });
    if (!originalPost) throw new NotFoundException('Original post not found');

    const repost = this.postRepo.create({
      author_id: authorId,
      is_repost: true,
      original_post_id: postId,
      privacy: PostPrivacy.PUBLIC, // Default for reposts, could be customized
      ...ctx,
    });

    const savedRepost = await this.postRepo.save(repost);

    // Increment share count of original post
    await this.postRepo.increment({ id: postId }, 'share_count', 1);

    return savedRepost;
  }
}
