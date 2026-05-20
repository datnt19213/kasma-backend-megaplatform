import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SocialConnection,
  ConnectionType,
  ConnectionStatus,
} from '@/entities/social/social-connection.entity';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { UserActivityLog, ActivityAction } from '@/entities/mongo/user-activity-log.mongo-entity';

interface Ctx {
  app_key: string;
  tenant_key: string;
}

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(UserActivityLog, 'mongo')
    private readonly activityLogRepo: Repository<UserActivityLog>,
  ) {}

  // ─────────────────────────────────────────────
  // FOLLOW / UNFOLLOW
  // ─────────────────────────────────────────────

  async toggleFollow(requesterId: string, addresseeId: string, ctx: Ctx) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Bạn không thể tự follow chính mình.');
    }

    const existing = await this.connectionRepo.findOne({
      where: { requester_id: requesterId, addressee_id: addresseeId, type: ConnectionType.FOLLOW, ...ctx },
    });

    if (existing) {
      // Unfollow
      await this.connectionRepo.remove(existing);
      await this.profileRepo.decrement(
        { user_id: addresseeId, ...ctx },
        'follower_count', 1,
      );
      await this.profileRepo.decrement(
        { user_id: requesterId, ...ctx },
        'following_count', 1,
      );
      return { action: 'UNFOLLOWED', addressee_id: addresseeId };
    }

    // Check if blocked
    const blocked = await this.connectionRepo.findOne({
      where: { requester_id: addresseeId, addressee_id: requesterId, type: ConnectionType.BLOCK, ...ctx },
    });
    if (blocked) throw new ForbiddenException('Không thể follow người dùng này.');

    const follow = this.connectionRepo.create({
      requester_id: requesterId,
      addressee_id: addresseeId,
      type: ConnectionType.FOLLOW,
      status: ConnectionStatus.ACTIVE,
      ...ctx,
    });
    await this.connectionRepo.save(follow);

    await this.profileRepo.increment({ user_id: addresseeId, ...ctx }, 'follower_count', 1);
    await this.profileRepo.increment({ user_id: requesterId, ...ctx }, 'following_count', 1);

    // Log activity for Discovery
    const log = this.activityLogRepo.create({
      actor_id: requesterId,
      target_id: addresseeId,
      action: ActivityAction.FOLLOWED_USER,
      ...ctx,
    });
    await this.activityLogRepo.save(log);

    return { action: 'FOLLOWED', addressee_id: addresseeId };
  }

  // ─────────────────────────────────────────────
  // FRIEND REQUEST
  // ─────────────────────────────────────────────

  async sendFriendRequest(requesterId: string, addresseeId: string, ctx: Ctx) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Bạn không thể kết bạn với chính mình.');
    }

    const existing = await this.connectionRepo.findOne({
      where: { requester_id: requesterId, addressee_id: addresseeId, type: ConnectionType.FRIEND, ...ctx },
    });
    if (existing) throw new ConflictException('Lời mời kết bạn đã tồn tại.');

    const blocked = await this.connectionRepo.findOne({
      where: { requester_id: addresseeId, addressee_id: requesterId, type: ConnectionType.BLOCK, ...ctx },
    });
    if (blocked) throw new ForbiddenException('Không thể gửi lời mời cho người dùng này.');

    const request = this.connectionRepo.create({
      requester_id: requesterId,
      addressee_id: addresseeId,
      type: ConnectionType.FRIEND,
      status: ConnectionStatus.PENDING,
      ...ctx,
    });

    const saved = await this.connectionRepo.save(request);

    // Log activity
    const log = this.activityLogRepo.create({
      actor_id: requesterId,
      target_id: addresseeId,
      action: ActivityAction.SENT_FRIEND_REQUEST,
      ...ctx,
    });
    await this.activityLogRepo.save(log);

    return saved;
  }

  async respondFriendRequest(
    requestId: string,
    responderId: string,
    action: 'ACCEPT' | 'REJECT',
    ctx: Ctx,
  ) {
    const request = await this.connectionRepo.findOne({
      where: { id: requestId, addressee_id: responderId, type: ConnectionType.FRIEND, status: ConnectionStatus.PENDING, ...ctx },
    });
    if (!request) throw new NotFoundException('Lời mời kết bạn không tồn tại hoặc bạn không có quyền.');

    if (action === 'ACCEPT') {
      request.status = ConnectionStatus.ACCEPTED;
      request.responded_at = new Date();
      await this.connectionRepo.save(request);

      await this.profileRepo.increment({ user_id: request.requester_id, ...ctx }, 'friend_count', 1);
      await this.profileRepo.increment({ user_id: responderId, ...ctx }, 'friend_count', 1);

      return { action: 'ACCEPTED', connection: request };
    }

    request.status = ConnectionStatus.REJECTED;
    request.responded_at = new Date();
    await this.connectionRepo.save(request);
    return { action: 'REJECTED', connection: request };
  }

  // ─────────────────────────────────────────────
  // BLOCK / UNBLOCK
  // ─────────────────────────────────────────────

  async toggleBlock(blockerId: string, targetId: string, ctx: Ctx) {
    if (blockerId === targetId) {
      throw new BadRequestException('Bạn không thể tự chặn chính mình.');
    }

    const existing = await this.connectionRepo.findOne({
      where: { requester_id: blockerId, addressee_id: targetId, type: ConnectionType.BLOCK, ...ctx },
    });

    if (existing) {
      await this.connectionRepo.remove(existing);
      return { action: 'UNBLOCKED', target_id: targetId };
    }

    // Remove any existing follow/friend connection between them when blocking
    await this.connectionRepo.delete({
      requester_id: blockerId,
      addressee_id: targetId,
      type: ConnectionType.FOLLOW,
      ...ctx,
    } as any);

    const block = this.connectionRepo.create({
      requester_id: blockerId,
      addressee_id: targetId,
      type: ConnectionType.BLOCK,
      status: ConnectionStatus.ACTIVE,
      ...ctx,
    });
    await this.connectionRepo.save(block);
    return { action: 'BLOCKED', target_id: targetId };
  }

  // ─────────────────────────────────────────────
  // LIST QUERIES
  // ─────────────────────────────────────────────

  async getFollowing(userId: string, ctx: Ctx, page = 1, limit = 20) {
    const [data, total] = await this.connectionRepo.findAndCount({
      where: { requester_id: userId, type: ConnectionType.FOLLOW, status: ConnectionStatus.ACTIVE, ...ctx },
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getFollowers(userId: string, ctx: Ctx, page = 1, limit = 20) {
    const [data, total] = await this.connectionRepo.findAndCount({
      where: { addressee_id: userId, type: ConnectionType.FOLLOW, status: ConnectionStatus.ACTIVE, ...ctx },
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getFriends(userId: string, ctx: Ctx, page = 1, limit = 20) {
    const [data, total] = await this.connectionRepo.findAndCount({
      where: [
        { requester_id: userId, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
        { addressee_id: userId, type: ConnectionType.FRIEND, status: ConnectionStatus.ACCEPTED, ...ctx },
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getPendingRequests(userId: string, ctx: Ctx) {
    return await this.connectionRepo.find({
      where: { addressee_id: userId, type: ConnectionType.FRIEND, status: ConnectionStatus.PENDING, ...ctx },
      order: { created_at: 'DESC' },
    });
  }
}
