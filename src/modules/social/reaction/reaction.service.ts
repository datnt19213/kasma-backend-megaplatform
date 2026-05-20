import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialReaction, ReactionType, TargetType } from '@/entities/social/social-reaction.entity';
import { SocialPost } from '@/entities/social/social-post.entity';
import { SocialComment } from '@/entities/social/social-comment.entity';
import { NoticeService } from '../notice/notice.service';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export class ToggleReactionDto {
  target_type: TargetType;
  target_id: string;
  reaction_type: ReactionType;
}

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(SocialReaction, 'postgres')
    private readonly reactionRepo: Repository<SocialReaction>,
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(SocialComment, 'postgres')
    private readonly commentRepo: Repository<SocialComment>,
    private readonly noticeService: NoticeService,
  ) {}

  async toggleReaction(userId: string, dto: ToggleReactionDto, ctx: Ctx) {
    // Verify target exists
    if (dto.target_type === TargetType.POST) {
      const post = await this.postRepo.findOne({ where: { id: dto.target_id, is_deleted: false, ...ctx } });
      if (!post) throw new NotFoundException('Post not found');
    } else {
      const comment = await this.commentRepo.findOne({ where: { id: dto.target_id, is_deleted: false, ...ctx } });
      if (!comment) throw new NotFoundException('Comment not found');
    }

    // Check if reaction already exists
    const existing = await this.reactionRepo.findOne({
      where: {
        user_id: userId,
        target_type: dto.target_type,
        target_id: dto.target_id,
        ...ctx,
      },
    });

    if (existing) {
      if (existing.reaction_type === dto.reaction_type) {
        // Remove reaction if clicking the same type
        await this.reactionRepo.remove(existing);
        await this.incrementTargetCount(dto.target_type, dto.target_id, -1);
        return { success: true, action: 'removed' };
      } else {
        // Change reaction type
        existing.reaction_type = dto.reaction_type;
        await this.reactionRepo.save(existing);
        return { success: true, action: 'changed', reaction: existing };
      }
    } else {
      // Create new reaction
      const newReaction = this.reactionRepo.create({
        user_id: userId,
        target_type: dto.target_type,
        target_id: dto.target_id,
        reaction_type: dto.reaction_type,
        ...ctx,
      });
      await this.reactionRepo.save(newReaction);
      await this.incrementTargetCount(dto.target_type, dto.target_id, 1);
      await this.notifyReactionOwner(userId, dto, ctx);
      return { success: true, action: 'added', reaction: newReaction };
    }
  }

  private async notifyReactionOwner(
    actorId: string,
    dto: ToggleReactionDto,
    ctx: Ctx,
  ) {
    if (dto.target_type === TargetType.POST) {
      const post = await this.postRepo.findOne({
        where: { id: dto.target_id, is_deleted: false, ...ctx },
      });
      if (post) {
        await this.noticeService.notifyLike(ctx, post.author_id, actorId, 'POST', post.id);
      }
      return;
    }

    const comment = await this.commentRepo.findOne({
      where: { id: dto.target_id, is_deleted: false, ...ctx },
    });
    if (comment) {
      await this.noticeService.notifyLike(ctx, comment.author_id, actorId, 'COMMENT', comment.id);
    }
  }

  async getReactions(targetType: TargetType, targetId: string, ctx: Ctx) {
    return this.reactionRepo.find({
      where: { target_type: targetType, target_id: targetId, ...ctx },
      order: { created_at: 'DESC' },
    });
  }

  private async incrementTargetCount(targetType: TargetType, targetId: string, incrementValue: number) {
    if (targetType === TargetType.POST) {
      await this.postRepo.increment({ id: targetId }, 'like_count', incrementValue);
    } else if (targetType === TargetType.COMMENT) {
      await this.commentRepo.increment({ id: targetId }, 'like_count', incrementValue);
    }
  }
}
