import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SocialStory, StoryType } from '@/entities/social/social-story.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export class CreateStoryDto {
  type: StoryType;
  media_url: string;
  media_provider?: string;
  caption?: string;
  music_track?: string;
  expires_in_hours?: number;
}

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(SocialStory, 'postgres')
    private readonly storyRepo: Repository<SocialStory>,
  ) {}

  async createStory(authorId: string, dto: CreateStoryDto, ctx: Ctx) {
    const hours = dto.expires_in_hours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const story = this.storyRepo.create({
      author_id: authorId,
      type: dto.type,
      media_url: dto.media_url,
      media_provider: dto.media_provider,
      caption: dto.caption,
      music_track: dto.music_track,
      expires_at: expiresAt,
      ...ctx,
    });

    return this.storyRepo.save(story);
  }

  async getActiveStoriesByAuthor(authorId: string, ctx: Ctx) {
    return this.storyRepo.find({
      where: {
        author_id: authorId,
        is_deleted: false,
        ...ctx,
      },
      order: { created_at: 'ASC' },
    });
  }

  async viewStory(storyId: string, ctx: Ctx) {
    const story = await this.storyRepo.findOne({ where: { id: storyId, ...ctx } });
    if (!story) throw new NotFoundException('Story not found');
    if (story.expires_at < new Date() || story.is_deleted) throw new NotFoundException('Story expired');

    await this.storyRepo.increment({ id: storyId }, 'view_count', 1);
    return { success: true };
  }

  async deleteStory(storyId: string, authorId: string, ctx: Ctx) {
    const story = await this.storyRepo.findOne({ where: { id: storyId, author_id: authorId, ...ctx } });
    if (!story) throw new NotFoundException('Story not found');

    story.is_deleted = true;
    await this.storyRepo.save(story);
    return { success: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories() {
    // Note: In a real multi-tenant environment without ctx, 
    // we would either run this per tenant or soft-delete globally.
    // For simplicity, we just delete universally expired stories here.
    await this.storyRepo.update(
      { expires_at: LessThan(new Date()), is_deleted: false },
      { is_deleted: true },
    );
  }
}
