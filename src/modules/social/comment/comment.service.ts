import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SocialComment } from '@/entities/social/social-comment.entity';
import { SocialPost } from '@/entities/social/social-post.entity';
import { SocialMention, MentionSourceType } from '@/entities/mongo/social-mention.mongo-entity';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { User } from '@/entities/user.entity';
import { NoticeService } from '../notice/notice.service';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export class CreateCommentDto {
  post_id: string;
  content: string;
  parent_comment_id?: string;
  mentions?: string[]; // Array of mentioned User IDs
}

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(SocialComment, 'postgres')
    private readonly commentRepo: Repository<SocialComment>,
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(SocialMention, 'mongo')
    private readonly mentionRepo: Repository<SocialMention>,
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(User, 'postgres')
    private readonly userRepo: Repository<User>,
    private readonly noticeService: NoticeService,
  ) {}

  async createComment(authorId: string, dto: CreateCommentDto, ctx: Ctx) {
    const post = await this.postRepo.findOne({ where: { id: dto.post_id, is_deleted: false, ...ctx } });
    if (!post) throw new NotFoundException('Post not found');

    if (dto.parent_comment_id) {
      const parent = await this.commentRepo.findOne({ where: { id: dto.parent_comment_id, post_id: dto.post_id, ...ctx } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepo.create({
      post_id: dto.post_id,
      author_id: authorId,
      content: dto.content,
      parent_comment_id: dto.parent_comment_id,
      ...ctx,
    });

    const savedComment = await this.commentRepo.save(comment);

    // Sync Counters
    await this.postRepo.increment({ id: dto.post_id }, 'comment_count', 1);
    if (dto.parent_comment_id) {
      await this.commentRepo.increment({ id: dto.parent_comment_id }, 'reply_count', 1);
    }

    // Handle Mentions
    if (dto.mentions && dto.mentions.length > 0) {
      const mentionsToSave = dto.mentions.map((mentionedId) => 
        this.mentionRepo.create({
          source_type: MentionSourceType.COMMENT,
          source_id: savedComment.id,
          mentioned_user_id: mentionedId,
          author_id: authorId,
          ...ctx,
        })
      );
      await this.mentionRepo.save(mentionsToSave);

      for (const mentionedId of dto.mentions) {
        await this.noticeService.notifyTag(
          ctx,
          mentionedId,
          authorId,
          'COMMENT',
          savedComment.id,
        );
      }
    }

    await this.noticeService.notifyComment(
      ctx,
      post.author_id,
      authorId,
      post.id,
      savedComment.id,
    );

    return savedComment;
  }

  async getCommentsByPost(postId: string, ctx: Ctx, page = 1, limit = 20) {
    const [comments, total] = await this.commentRepo.findAndCount({
      where: { post_id: postId, parent_comment_id: null, is_deleted: false, ...ctx } as any,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const populatedComments = await this.populateMentions(comments, ctx);

    return { data: populatedComments, total, page, limit };
  }

  async getReplies(commentId: string, ctx: Ctx, page = 1, limit = 20) {
    const [replies, total] = await this.commentRepo.findAndCount({
      where: { parent_comment_id: commentId, is_deleted: false, ...ctx } as any,
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const populatedReplies = await this.populateMentions(replies, ctx);

    return { data: populatedReplies, total, page, limit };
  }

  private async populateMentions(comments: SocialComment[], ctx: Ctx) {
    if (comments.length === 0) return comments;
    const commentIds = comments.map(c => c.id);

    // Fetch mentions from Mongo
    const mentions = await this.mentionRepo.find({
      where: { source_type: MentionSourceType.COMMENT, source_id: { $in: commentIds }, ...ctx } as any,
    });

    if (mentions.length === 0) return comments;

    // Fetch populated user data for mentioned users
    const mentionedUserIds = [...new Set(mentions.map(m => m.mentioned_user_id))];
    const profiles = await this.profileRepo.find({
      where: { user_id: { $in: mentionedUserIds } as any, ...ctx },
    });
    
    const users = await this.userRepo.find({
      where: { id: In(mentionedUserIds), ...ctx },
    });

    const profileMap = new Map();
    mentionedUserIds.forEach(id => {
      const p = profiles.find(pr => pr.user_id === id);
      const u = users.find(usr => usr.id === id);
      profileMap.set(id, {
        id,
        name: u?.display_name || '',
        username: u?.email || '', // Using email as fallback username
        avatar: p?.avatar_url || '',
      });
    });

    return comments.map(comment => {
      const commentMentions = mentions.filter(m => m.source_id === comment.id);
      const populated = commentMentions.map(m => profileMap.get(m.mentioned_user_id)).filter(Boolean);
      return { ...comment, mentions: populated };
    });
  }

  async deleteComment(commentId: string, authorId: string, ctx: Ctx) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId, author_id: authorId, ...ctx } });
    if (!comment) throw new NotFoundException('Comment not found or unauthorized');

    comment.is_deleted = true;
    await this.commentRepo.save(comment);

    // Decrement counters
    await this.postRepo.decrement({ id: comment.post_id }, 'comment_count', 1);
    if (comment.parent_comment_id) {
      await this.commentRepo.decrement({ id: comment.parent_comment_id }, 'reply_count', 1);
    }

    return { success: true };
  }
}
