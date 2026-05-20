import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SocialPostTag, TagType } from '@/entities/mongo/social-post-tag.mongo-entity';

import {
  extractHashtagsFromContent,
  hashtagsFromManualTags,
  normalizeHashtagSlug,
} from './hashtag.util';

export interface TagLike {
  target_id?: string;
  target_name?: string;
  type: TagType | string;
}

@Injectable()
export class HashtagIndexService {
  constructor(
    @InjectRepository(SocialPostTag, 'mongo')
    private readonly postTagRepo: Repository<SocialPostTag>,
  ) {}

  /**
   * Drops existing hashtag index rows for a post (user/location tags unchanged),
   * then inserts merged hashtags from content + manual hashtag tags (deduped).
   */
  async reindexPostHashtags(
    postId: string,
    content: string | null | undefined,
    ctx: { app_key: string; tenant_key: string },
    manualTags?: ReadonlyArray<TagLike>,
  ): Promise<void> {
    await this.postTagRepo.delete({
      post_id: postId,
      type: TagType.HASHTAG,
      ...ctx,
    } as Record<string, unknown>);

    const fromContent = extractHashtagsFromContent(content);
    const manual = manualTags?.length ? hashtagsFromManualTags(manualTags) : [];
    const merged = [...new Set([...fromContent, ...manual])];
    if (merged.length === 0) return;

    const docs = merged.map((slug) =>
      this.postTagRepo.create({
        post_id: postId,
        type: TagType.HASHTAG,
        target_id: slug,
        target_name: `#${normalizeHashtagSlug(slug)}`,
        ...ctx,
      }),
    );
    await this.postTagRepo.save(docs);
  }
}
