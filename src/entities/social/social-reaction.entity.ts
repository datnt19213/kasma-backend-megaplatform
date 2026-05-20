import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

export enum TargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

@Entity('social_reactions')
@Index(['user_id', 'target_type', 'target_id'], { unique: true }) // Each user can react once per target
@Index(['target_type', 'target_id']) // For fetching all reactions of a post/comment
export class SocialReaction extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: TargetType,
  })
  target_type: TargetType;

  @Column()
  target_id: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  reaction_type: ReactionType;
}
