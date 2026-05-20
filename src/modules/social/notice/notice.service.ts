import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SocialNotice,
  SocialNoticeReferenceType,
  SocialNoticeType,
} from '@/entities/social/social-notice.entity';
import { NotificationClientService } from '@/modules/integration/notification-client.service';
import { SocketClientService } from '@/modules/integration/socket-client.service';
import { SocialCtx } from '../common/social-context';

export interface DispatchNoticeInput {
  ctx: SocialCtx;
  recipientId: string;
  actorId?: string;
  noticeType: SocialNoticeType;
  title: string;
  body: string;
  referenceType?: SocialNoticeReferenceType;
  referenceId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  skipRealtime?: boolean;
}

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(SocialNotice, 'postgres')
    private readonly noticeRepo: Repository<SocialNotice>,
    private readonly notificationClient: NotificationClientService,
    private readonly socketClient: SocketClientService,
  ) {}

  async listNotices(
    userId: string,
    ctx: SocialCtx,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ) {
    const where: Record<string, unknown> = {
      recipient_id: userId,
      ...ctx,
    };
    if (unreadOnly) {
      where.is_read = false;
    }

    const [data, total] = await this.noticeRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getUnreadCount(userId: string, ctx: SocialCtx) {
    const count = await this.noticeRepo.count({
      where: { recipient_id: userId, is_read: false, ...ctx },
    });
    return { unread_count: count };
  }

  async markRead(noticeId: string, userId: string, ctx: SocialCtx) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId, recipient_id: userId, ...ctx },
    });
    if (!notice) {
      throw new NotFoundException('Notice not found.');
    }
    notice.is_read = true;
    notice.read_at = new Date();
    await this.noticeRepo.save(notice);
    return notice;
  }

  async markAllRead(userId: string, ctx: SocialCtx) {
    await this.noticeRepo.update(
      { recipient_id: userId, is_read: false, ...ctx },
      { is_read: true, read_at: new Date() },
    );
    return { success: true };
  }

  async dispatch(input: DispatchNoticeInput): Promise<SocialNotice | null> {
    if (input.actorId && input.actorId === input.recipientId) {
      return null;
    }

    const notice = await this.noticeRepo.save(
      this.noticeRepo.create({
        recipient_id: input.recipientId,
        actor_id: input.actorId,
        notice_type: input.noticeType,
        title: input.title,
        body: input.body,
        reference_type: input.referenceType,
        reference_id: input.referenceId,
        metadata: input.metadata,
        is_read: false,
        app_key: input.ctx.app_key,
        tenant_key: input.ctx.tenant_key,
      }),
    );

    if (!input.skipRealtime) {
      await this.socketClient.publish({
        tenant_key: input.ctx.tenant_key,
        app_key: input.ctx.app_key,
        channel: this.socketClient.userNoticeChannel(input.recipientId),
        event: 'notice.new',
        payload: {
          notice: {
            id: notice.id,
            notice_type: notice.notice_type,
            title: notice.title,
            body: notice.body,
            actor_id: notice.actor_id,
            reference_type: notice.reference_type,
            reference_id: notice.reference_id,
            metadata: notice.metadata,
            created_at: notice.created_at,
          },
        },
      });
    }

    await this.notificationClient.sendNotification(input.ctx.tenant_key, input.ctx.app_key, {
      userId: input.recipientId,
      title: input.title,
      content: input.body,
      type: 'IN_APP',
      metadata: {
        social_notice_id: notice.id,
        notice_type: input.noticeType,
        ...(input.referenceType ? { reference_type: input.referenceType } : {}),
        ...(input.referenceId ? { reference_id: input.referenceId } : {}),
        ...(input.metadata || {}),
      },
    });

    await this.notificationClient.sendNotification(input.ctx.tenant_key, input.ctx.app_key, {
      userId: input.recipientId,
      title: input.title,
      content: input.body,
      type: 'PUSH',
      metadata: {
        social_notice_id: notice.id,
        notice_type: input.noticeType,
      },
    });

    return notice;
  }

  async notifyLike(
    ctx: SocialCtx,
    recipientId: string,
    actorId: string,
    targetType: 'POST' | 'COMMENT',
    targetId: string,
  ) {
    return this.dispatch({
      ctx,
      recipientId,
      actorId,
      noticeType: SocialNoticeType.LIKE,
      title: 'New like',
      body: `Someone reacted to your ${targetType.toLowerCase()}.`,
      referenceType:
        targetType === 'POST'
          ? SocialNoticeReferenceType.POST
          : SocialNoticeReferenceType.COMMENT,
      referenceId: targetId,
      metadata: { target_type: targetType },
    });
  }

  async notifyComment(
    ctx: SocialCtx,
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
  ) {
    return this.dispatch({
      ctx,
      recipientId,
      actorId,
      noticeType: SocialNoticeType.COMMENT,
      title: 'New comment',
      body: 'Someone commented on your post.',
      referenceType: SocialNoticeReferenceType.COMMENT,
      referenceId: commentId,
      metadata: { post_id: postId },
    });
  }

  async notifyTag(
    ctx: SocialCtx,
    recipientId: string,
    actorId: string,
    sourceType: 'POST' | 'COMMENT',
    sourceId: string,
  ) {
    return this.dispatch({
      ctx,
      recipientId,
      actorId,
      noticeType: SocialNoticeType.TAG,
      title: 'You were mentioned',
      body: `You were tagged in a ${sourceType.toLowerCase()}.`,
      referenceType:
        sourceType === 'POST'
          ? SocialNoticeReferenceType.POST
          : SocialNoticeReferenceType.COMMENT,
      referenceId: sourceId,
    });
  }
}
