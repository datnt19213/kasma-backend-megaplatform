import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum GroupMemberRole {
  MEMBER = 'MEMBER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum GroupMemberStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

@Entity('social_group_members')
@Index(['group_id', 'user_id', 'app_key', 'tenant_key'], { unique: true })
@Index(['user_id', 'status', 'app_key', 'tenant_key'])
export class SocialGroupMember extends MultiTenantEntity {
  @Column()
  group_id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: GroupMemberRole,
    default: GroupMemberRole.MEMBER,
  })
  role: GroupMemberRole;

  @Column({
    type: 'enum',
    enum: GroupMemberStatus,
    default: GroupMemberStatus.ACTIVE,
  })
  status: GroupMemberStatus;
}
