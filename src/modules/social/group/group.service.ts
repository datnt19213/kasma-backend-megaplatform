import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  GroupPostApprovalStatus,
  PostPrivacy,
  PostType,
  SocialPost,
} from '@/entities/social/social-post.entity';
import {
  GroupMemberRole,
  GroupMemberStatus,
  SocialGroupMember,
} from '@/entities/social/social-group-member.entity';
import {
  SocialGroup,
  SocialGroupPrivacy,
  SocialGroupType,
} from '@/entities/social/social-group.entity';
import {
  SocialNoticeReferenceType,
  SocialNoticeType,
} from '@/entities/social/social-notice.entity';
import { NoticeService } from '../notice/notice.service';
import { HashtagIndexService } from '../trending/hashtag-index.service';
import { SocialCtx } from '../common/social-context';
import { CreatePostDto } from '../post/post.service';

export class CreateCommunityDto {
  name: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
  privacy?: SocialGroupPrivacy;
  requires_post_approval?: boolean;
}

export class CreateFanpageDto {
  name: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
  organization_name?: string;
  business_category?: string;
}

export class CreateGroupPostDto extends CreatePostDto {}

export class UpdateMemberRoleDto {
  role: GroupMemberRole.MODERATOR | GroupMemberRole.ADMIN | GroupMemberRole.MEMBER;
}

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(SocialGroup, 'postgres')
    private readonly groupRepo: Repository<SocialGroup>,
    @InjectRepository(SocialGroupMember, 'postgres')
    private readonly memberRepo: Repository<SocialGroupMember>,
    @InjectRepository(SocialPost, 'postgres')
    private readonly postRepo: Repository<SocialPost>,
    private readonly noticeService: NoticeService,
    private readonly hashtagIndex: HashtagIndexService,
  ) {}

  async createCommunity(userId: string, dto: CreateCommunityDto, ctx: SocialCtx) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Community name is required.');
    }

    const slug = await this.generateUniqueSlug(name, ctx);
    const group = await this.groupRepo.save(
      this.groupRepo.create({
        type: SocialGroupType.COMMUNITY,
        name,
        slug,
        description: dto.description,
        avatar_url: dto.avatar_url,
        cover_url: dto.cover_url,
        privacy: dto.privacy || SocialGroupPrivacy.PUBLIC,
        requires_post_approval: dto.requires_post_approval ?? false,
        created_by: userId,
        member_count: 1,
        ...ctx,
      }),
    );

    await this.memberRepo.save(
      this.memberRepo.create({
        group_id: group.id,
        user_id: userId,
        role: GroupMemberRole.OWNER,
        status: GroupMemberStatus.ACTIVE,
        ...ctx,
      }),
    );

    return group;
  }

  async createFanpage(userId: string, dto: CreateFanpageDto, ctx: SocialCtx) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Fanpage name is required.');
    }

    const slug = await this.generateUniqueSlug(name, ctx);
    const group = await this.groupRepo.save(
      this.groupRepo.create({
        type: SocialGroupType.FANPAGE,
        name,
        slug,
        description: dto.description,
        avatar_url: dto.avatar_url,
        cover_url: dto.cover_url,
        organization_name: dto.organization_name,
        business_category: dto.business_category,
        privacy: SocialGroupPrivacy.PUBLIC,
        requires_post_approval: false,
        created_by: userId,
        member_count: 1,
        ...ctx,
      }),
    );

    await this.memberRepo.save(
      this.memberRepo.create({
        group_id: group.id,
        user_id: userId,
        role: GroupMemberRole.OWNER,
        status: GroupMemberStatus.ACTIVE,
        ...ctx,
      }),
    );

    return group;
  }

  async listGroups(
    ctx: SocialCtx,
    type?: SocialGroupType,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    const qb = this.groupRepo
      .createQueryBuilder('g')
      .where('g.app_key = :appKey', { appKey: ctx.app_key })
      .andWhere('g.tenant_key = :tenantKey', { tenantKey: ctx.tenant_key })
      .andWhere('g.is_archived = false');

    if (type) {
      qb.andWhere('g.type = :type', { type });
    }
    if (search?.trim()) {
      qb.andWhere('(g.name ILIKE :search OR g.slug ILIKE :search)', {
        search: `%${search.trim()}%`,
      });
    }

    qb.orderBy('g.member_count', 'DESC').addOrderBy('g.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getGroup(groupId: string, userId: string, ctx: SocialCtx) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId, is_archived: false, ...ctx },
    });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    const membership = await this.memberRepo.findOne({
      where: { group_id: groupId, user_id: userId, ...ctx },
    });

    return {
      ...group,
      my_membership: membership || null,
    };
  }

  async joinGroup(groupId: string, userId: string, ctx: SocialCtx) {
    const group = await this.getActiveGroup(groupId, ctx);
    const existing = await this.memberRepo.findOne({
      where: { group_id: groupId, user_id: userId, ...ctx },
    });

    if (existing) {
      if (existing.status === GroupMemberStatus.BANNED) {
        throw new ForbiddenException('You are banned from this group.');
      }
      if (existing.status === GroupMemberStatus.ACTIVE) {
        return { status: 'ALREADY_MEMBER', membership: existing };
      }
      if (existing.status === GroupMemberStatus.PENDING) {
        return { status: 'PENDING', membership: existing };
      }
    }

    const isPrivateCommunity =
      group.type === SocialGroupType.COMMUNITY &&
      group.privacy === SocialGroupPrivacy.PRIVATE;

    const status =
      isPrivateCommunity && group.created_by !== userId
        ? GroupMemberStatus.PENDING
        : GroupMemberStatus.ACTIVE;

    const membership = existing
      ? await this.memberRepo.save({ ...existing, status, role: GroupMemberRole.MEMBER })
      : await this.memberRepo.save(
          this.memberRepo.create({
            group_id: groupId,
            user_id: userId,
            role: GroupMemberRole.MEMBER,
            status,
            ...ctx,
          }),
        );

    if (status === GroupMemberStatus.ACTIVE && !existing) {
      await this.groupRepo.increment({ id: groupId }, 'member_count', 1);
    }

    if (status === GroupMemberStatus.PENDING) {
      const admins = await this.getGroupModerators(groupId, ctx);
      for (const admin of admins) {
        await this.noticeService.dispatch({
          ctx,
          recipientId: admin.user_id,
          actorId: userId,
          noticeType: SocialNoticeType.GROUP_JOIN_REQUEST,
          title: 'New join request',
          body: `A user requested to join ${group.name}.`,
          referenceType: SocialNoticeReferenceType.GROUP,
          referenceId: groupId,
          metadata: { member_id: membership.id },
        });
      }
    }

    return { status, membership };
  }

  async leaveGroup(groupId: string, userId: string, ctx: SocialCtx) {
    const membership = await this.memberRepo.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
        status: GroupMemberStatus.ACTIVE,
        ...ctx,
      },
    });
    if (!membership) {
      throw new NotFoundException('Active membership not found.');
    }
    if (membership.role === GroupMemberRole.OWNER) {
      throw new BadRequestException('Transfer ownership before leaving the group.');
    }

    await this.memberRepo.remove(membership);
    await this.groupRepo.decrement({ id: groupId }, 'member_count', 1);
    return { success: true };
  }

  async listMembers(groupId: string, userId: string, ctx: SocialCtx, page = 1, limit = 50) {
    await this.assertActiveMember(groupId, userId, ctx);

    const [data, total] = await this.memberRepo.findAndCount({
      where: { group_id: groupId, ...ctx },
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async approveMember(
    actorId: string,
    groupId: string,
    targetUserId: string,
    ctx: SocialCtx,
  ) {
    await this.assertModerator(groupId, actorId, ctx);

    const membership = await this.memberRepo.findOne({
      where: {
        group_id: groupId,
        user_id: targetUserId,
        status: GroupMemberStatus.PENDING,
        ...ctx,
      },
    });
    if (!membership) {
      throw new NotFoundException('Pending membership not found.');
    }

    membership.status = GroupMemberStatus.ACTIVE;
    await this.memberRepo.save(membership);
    await this.groupRepo.increment({ id: groupId }, 'member_count', 1);

    const group = await this.getActiveGroup(groupId, ctx);
    await this.noticeService.dispatch({
      ctx,
      recipientId: targetUserId,
      actorId,
      noticeType: SocialNoticeType.GROUP_INVITE,
      title: 'Join request approved',
      body: `You are now a member of ${group.name}.`,
      referenceType: SocialNoticeReferenceType.GROUP,
      referenceId: groupId,
    });

    return membership;
  }

  async updateMemberRole(
    actorId: string,
    groupId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
    ctx: SocialCtx,
  ) {
    const actor = await this.assertAdmin(groupId, actorId, ctx);
    if (actor.role !== GroupMemberRole.OWNER) {
      throw new ForbiddenException('Only the owner can change member roles.');
    }

    const target = await this.memberRepo.findOne({
      where: {
        group_id: groupId,
        user_id: targetUserId,
        status: GroupMemberStatus.ACTIVE,
        ...ctx,
      },
    });
    if (!target) {
      throw new NotFoundException('Member not found.');
    }
    if (target.role === GroupMemberRole.OWNER) {
      throw new BadRequestException('Cannot change the owner role.');
    }

    target.role = dto.role;
    return this.memberRepo.save(target);
  }

  async removeMember(actorId: string, groupId: string, targetUserId: string, ctx: SocialCtx) {
    if (actorId !== targetUserId) {
      await this.assertModerator(groupId, actorId, ctx);
    }

    const target = await this.memberRepo.findOne({
      where: { group_id: groupId, user_id: targetUserId, ...ctx },
    });
    if (!target) {
      throw new NotFoundException('Member not found.');
    }
    if (target.role === GroupMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove the group owner.');
    }

    const wasActive = target.status === GroupMemberStatus.ACTIVE;
    target.status = GroupMemberStatus.BANNED;
    await this.memberRepo.save(target);

    if (wasActive) {
      await this.groupRepo.decrement({ id: groupId }, 'member_count', 1);
    }

    return { success: true };
  }

  async createGroupPost(
    authorId: string,
    groupId: string,
    dto: CreateGroupPostDto,
    ctx: SocialCtx,
  ) {
    const group = await this.getActiveGroup(groupId, ctx);
    await this.assertActiveMember(groupId, authorId, ctx);

    const needsApproval = group.requires_post_approval;
    const approvalStatus = needsApproval
      ? GroupPostApprovalStatus.PENDING
      : GroupPostApprovalStatus.APPROVED;

    const post = await this.postRepo.save(
      this.postRepo.create({
        author_id: authorId,
        content: dto.content,
        type: dto.type || PostType.TEXT,
        privacy: PostPrivacy.PUBLIC,
        group_id: groupId,
        approval_status: approvalStatus,
        ...ctx,
      }),
    );

    if (approvalStatus === GroupPostApprovalStatus.APPROVED) {
      await this.groupRepo.increment({ id: groupId }, 'post_count', 1);
      await this.hashtagIndex.reindexPostHashtags(post.id, post.content, ctx, dto.tags);
    } else {
      const moderators = await this.getGroupModerators(groupId, ctx);
      for (const mod of moderators) {
        await this.noticeService.dispatch({
          ctx,
          recipientId: mod.user_id,
          actorId: authorId,
          noticeType: SocialNoticeType.GROUP_POST_PENDING,
          title: 'Post awaiting approval',
          body: `A new post in ${group.name} needs moderation.`,
          referenceType: SocialNoticeReferenceType.POST,
          referenceId: post.id,
          metadata: { group_id: groupId },
        });
      }
    }

    return post;
  }

  async listGroupPosts(
    userId: string,
    groupId: string,
    ctx: SocialCtx,
    page = 1,
    limit = 20,
  ) {
    const group = await this.getActiveGroup(groupId, ctx);
    const membership = await this.assertActiveMember(groupId, userId, ctx);
    const canModerate = this.canModerate(membership.role);

    const qb = this.postRepo
      .createQueryBuilder('p')
      .where('p.group_id = :groupId', { groupId })
      .andWhere('p.app_key = :appKey', { appKey: ctx.app_key })
      .andWhere('p.tenant_key = :tenantKey', { tenantKey: ctx.tenant_key })
      .andWhere('p.is_deleted = false');

    if (!canModerate) {
      qb.andWhere('p.approval_status = :approved', {
        approved: GroupPostApprovalStatus.APPROVED,
      });
    } else if (group.requires_post_approval) {
      qb.andWhere('p.approval_status IN (:...statuses)', {
        statuses: [GroupPostApprovalStatus.APPROVED, GroupPostApprovalStatus.PENDING],
      });
    }

    qb.orderBy('p.created_at', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async approveGroupPost(actorId: string, groupId: string, postId: string, ctx: SocialCtx) {
    await this.assertModerator(groupId, actorId, ctx);
    const post = await this.getPendingGroupPost(groupId, postId, ctx);

    post.approval_status = GroupPostApprovalStatus.APPROVED;
    await this.postRepo.save(post);
    await this.groupRepo.increment({ id: groupId }, 'post_count', 1);

    await this.hashtagIndex.reindexPostHashtags(post.id, post.content, ctx, []);

    await this.noticeService.dispatch({
      ctx,
      recipientId: post.author_id,
      actorId,
      noticeType: SocialNoticeType.GROUP_POST_APPROVED,
      title: 'Post approved',
      body: 'Your group post was approved by a moderator.',
      referenceType: SocialNoticeReferenceType.POST,
      referenceId: post.id,
      metadata: { group_id: groupId },
    });

    return post;
  }

  async rejectGroupPost(actorId: string, groupId: string, postId: string, ctx: SocialCtx) {
    await this.assertModerator(groupId, actorId, ctx);
    const post = await this.getPendingGroupPost(groupId, postId, ctx);

    post.approval_status = GroupPostApprovalStatus.REJECTED;
    await this.postRepo.save(post);

    await this.noticeService.dispatch({
      ctx,
      recipientId: post.author_id,
      actorId,
      noticeType: SocialNoticeType.GROUP_POST_REJECTED,
      title: 'Post rejected',
      body: 'Your group post was rejected by a moderator.',
      referenceType: SocialNoticeReferenceType.POST,
      referenceId: post.id,
      metadata: { group_id: groupId },
    });

    return post;
  }

  private async getPendingGroupPost(groupId: string, postId: string, ctx: SocialCtx) {
    const post = await this.postRepo.findOne({
      where: {
        id: postId,
        group_id: groupId,
        approval_status: GroupPostApprovalStatus.PENDING,
        is_deleted: false,
        ...ctx,
      },
    });
    if (!post) {
      throw new NotFoundException('Pending post not found.');
    }
    return post;
  }

  private async getActiveGroup(groupId: string, ctx: SocialCtx) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId, is_archived: false, ...ctx },
    });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }
    return group;
  }

  private async assertActiveMember(groupId: string, userId: string, ctx: SocialCtx) {
    const membership = await this.memberRepo.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
        status: GroupMemberStatus.ACTIVE,
        ...ctx,
      },
    });
    if (!membership) {
      throw new ForbiddenException('Active group membership required.');
    }
    return membership;
  }

  private async assertModerator(groupId: string, userId: string, ctx: SocialCtx) {
    const membership = await this.assertActiveMember(groupId, userId, ctx);
    if (!this.canModerate(membership.role)) {
      throw new ForbiddenException('Moderator permissions required.');
    }
    return membership;
  }

  private async assertAdmin(groupId: string, userId: string, ctx: SocialCtx) {
    const membership = await this.assertActiveMember(groupId, userId, ctx);
    if (
      membership.role !== GroupMemberRole.ADMIN &&
      membership.role !== GroupMemberRole.OWNER
    ) {
      throw new ForbiddenException('Admin permissions required.');
    }
    return membership;
  }

  private canModerate(role: GroupMemberRole): boolean {
    return (
      role === GroupMemberRole.MODERATOR ||
      role === GroupMemberRole.ADMIN ||
      role === GroupMemberRole.OWNER
    );
  }

  private async getGroupModerators(groupId: string, ctx: SocialCtx) {
    return this.memberRepo.find({
      where: {
        group_id: groupId,
        status: GroupMemberStatus.ACTIVE,
        role: In([
          GroupMemberRole.MODERATOR,
          GroupMemberRole.ADMIN,
          GroupMemberRole.OWNER,
        ]),
        ...ctx,
      },
    });
  }

  private async generateUniqueSlug(name: string, ctx: SocialCtx): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'group';

    let slug = base;
    let suffix = 1;
    while (
      await this.groupRepo.findOne({
        where: { slug, ...ctx },
      })
    ) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }
}
