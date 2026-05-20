import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum SocialGroupType {
  COMMUNITY = 'COMMUNITY',
  FANPAGE = 'FANPAGE',
}

export enum SocialGroupPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Entity('social_groups')
@Index(['slug', 'app_key', 'tenant_key'], { unique: true })
@Index(['type', 'app_key', 'tenant_key'])
export class SocialGroup extends MultiTenantEntity {
  @Column({
    type: 'enum',
    enum: SocialGroupType,
  })
  type: SocialGroupType;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({
    type: 'enum',
    enum: SocialGroupPrivacy,
    default: SocialGroupPrivacy.PUBLIC,
  })
  privacy: SocialGroupPrivacy;

  @Column({ default: false })
  requires_post_approval: boolean;

  @Column()
  created_by: string;

  @Column({ nullable: true })
  organization_name: string;

  @Column({ nullable: true })
  business_category: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'int', default: 1 })
  member_count: number;

  @Column({ type: 'int', default: 0 })
  post_count: number;

  @Column({ default: false })
  is_archived: boolean;
}
