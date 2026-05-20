import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, ObjectId, Repository } from 'typeorm';

import {
  ConnectionType,
  SocialConnection,
} from '@/entities/social/social-connection.entity';
import {
  ConversationType,
  SocialConversation,
} from '@/entities/social/social-conversation.entity';
import {
  ParticipantRole,
  SocialConversationParticipant,
} from '@/entities/social/social-conversation-participant.entity';
import { SocialMessage, MessageType } from '@/entities/mongo/social-message.mongo-entity';
import { User } from '@/entities/user.entity';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { SocketClientService } from '@/modules/integration/socket-client.service';

import { MessageEncryptionService } from './message-encryption.service';

const MAX_GROUP_MEMBERS = 256;

interface Ctx {
  app_key: string;
  tenant_key: string;
}

export class CreateDirectConversationDto {
  peer_user_id: string;
}

export class CreateGroupConversationDto {
  title: string;
  member_ids: string[];
}

export class SendMessageDto {
  content: string;
  message_type?: MessageType;
  metadata?: Record<string, string | number | boolean | null>;
}

export class AddGroupMembersDto {
  member_ids: string[];
}

export class UpdateParticipantRoleDto {
  role: ParticipantRole.ADMIN | ParticipantRole.MEMBER;
}

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(SocialConversation, 'postgres')
    private readonly conversationRepo: Repository<SocialConversation>,
    @InjectRepository(SocialConversationParticipant, 'postgres')
    private readonly participantRepo: Repository<SocialConversationParticipant>,
    @InjectRepository(SocialConnection, 'postgres')
    private readonly connectionRepo: Repository<SocialConnection>,
    @InjectRepository(User, 'postgres')
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile, 'postgres')
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(SocialMessage, 'mongo')
    private readonly messageRepo: Repository<SocialMessage>,
    private readonly encryptionService: MessageEncryptionService,
    private readonly socketClient: SocketClientService,
  ) {}

  async createDirectConversation(userId: string, dto: CreateDirectConversationDto, ctx: Ctx) {
    if (userId === dto.peer_user_id) {
      throw new BadRequestException('Cannot start a conversation with yourself.');
    }

    const peer = await this.userRepo.findOne({ where: { id: dto.peer_user_id, ...ctx } });
    if (!peer) {
      throw new NotFoundException('Peer user not found.');
    }

    if (await this.isBlocked(userId, dto.peer_user_id, ctx)) {
      throw new ForbiddenException('Messaging is not allowed with this user.');
    }

    const directPairKey = this.buildDirectPairKey(userId, dto.peer_user_id);
    const existing = await this.conversationRepo.findOne({
      where: { type: ConversationType.DIRECT, direct_pair_key: directPairKey, ...ctx },
    });
    if (existing) {
      return this.getConversation(existing.id, userId, ctx);
    }

    const conversation = await this.conversationRepo.save(
      this.conversationRepo.create({
        type: ConversationType.DIRECT,
        created_by: userId,
        direct_pair_key: directPairKey,
        ...ctx,
      }),
    );

    await this.participantRepo.save([
      this.participantRepo.create({
        conversation_id: conversation.id,
        user_id: userId,
        role: ParticipantRole.MEMBER,
        ...ctx,
      }),
      this.participantRepo.create({
        conversation_id: conversation.id,
        user_id: dto.peer_user_id,
        role: ParticipantRole.MEMBER,
        ...ctx,
      }),
    ]);

    return this.getConversation(conversation.id, userId, ctx);
  }

  async createGroupConversation(userId: string, dto: CreateGroupConversationDto, ctx: Ctx) {
    const title = dto.title?.trim();
    if (!title) {
      throw new BadRequestException('Group title is required.');
    }

    const memberIds = [...new Set([userId, ...(dto.member_ids || [])])];
    if (memberIds.length < 2) {
      throw new BadRequestException('A group requires at least two members.');
    }
    if (memberIds.length > MAX_GROUP_MEMBERS) {
      throw new BadRequestException(`Group cannot exceed ${MAX_GROUP_MEMBERS} members.`);
    }

    const users = await this.userRepo.find({ where: { id: In(memberIds), ...ctx } });
    if (users.length !== memberIds.length) {
      throw new BadRequestException('One or more member users were not found.');
    }

    for (const memberId of memberIds) {
      if (memberId === userId) continue;
      if (await this.isBlocked(userId, memberId, ctx)) {
        throw new ForbiddenException(`Cannot add blocked user ${memberId} to the group.`);
      }
    }

    const conversation = await this.conversationRepo.save(
      this.conversationRepo.create({
        type: ConversationType.GROUP,
        title,
        created_by: userId,
        ...ctx,
      }),
    );

    const participants = memberIds.map((memberId) =>
      this.participantRepo.create({
        conversation_id: conversation.id,
        user_id: memberId,
        role: memberId === userId ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
        ...ctx,
      }),
    );
    await this.participantRepo.save(participants);

    await this.publishConversationEvent(ctx, conversation.id, 'conversation.created', {
      conversation_id: conversation.id,
      type: ConversationType.GROUP,
      title,
    });

    return this.getConversation(conversation.id, userId, ctx);
  }

  async listConversations(userId: string, ctx: Ctx, page = 1, limit = 20) {
    const memberships = await this.participantRepo.find({
      where: { user_id: userId, left_at: IsNull(), ...ctx },
    });
    const conversationIds = memberships.map((m) => m.conversation_id);
    if (conversationIds.length === 0) {
      return { data: [], total: 0, page, limit };
    }

    const [conversations, total] = await this.conversationRepo.findAndCount({
      where: { id: In(conversationIds), is_archived: false, ...ctx },
      order: { last_message_at: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const populated = await Promise.all(
      conversations.map((c) => this.getConversation(c.id, userId, ctx)),
    );

    return { data: populated, total, page, limit };
  }

  async getConversation(conversationId: string, userId: string, ctx: Ctx) {
    await this.assertActiveParticipant(conversationId, userId, ctx);

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, ...ctx },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    const participants = await this.participantRepo.find({
      where: { conversation_id: conversationId, left_at: IsNull(), ...ctx },
    });

    const profiles = await this.populateProfiles(participants.map((p) => p.user_id), ctx);

    return {
      ...conversation,
      participants: participants.map((p) => ({
        user_id: p.user_id,
        role: p.role,
        last_read_at: p.last_read_at,
        is_muted: p.is_muted,
        profile: profiles.get(p.user_id) || null,
      })),
    };
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto, ctx: Ctx) {
    const content = dto.content?.trim();
    if (!content) {
      throw new BadRequestException('Message content is required.');
    }

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, ...ctx },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    await this.assertActiveParticipant(conversationId, userId, ctx);

    const encrypted = this.encryptionService.encrypt(content);
    const messageEntity = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: userId,
      message_type: dto.message_type || MessageType.TEXT,
      content_ciphertext: encrypted.content_ciphertext,
      content_iv: encrypted.content_iv,
      content_auth_tag: encrypted.content_auth_tag,
      metadata: dto.metadata,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    const message = await this.messageRepo.save(messageEntity);

    const preview = content.length > 120 ? `${content.slice(0, 117)}...` : content;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = preview;
    await this.conversationRepo.save(conversation);

    const response = this.mapMessage(message, content);

    await this.publishConversationEvent(ctx, conversationId, 'message.new', {
      message: response,
    });

    return response;
  }

  async listMessages(
    userId: string,
    conversationId: string,
    ctx: Ctx,
    page = 1,
    limit = 50,
  ) {
    await this.assertActiveParticipant(conversationId, userId, ctx);

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversation_id: conversationId, is_deleted: false, ...ctx } as Record<string, unknown>,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = messages
      .map((message) => {
        try {
          return this.mapMessage(
            message,
            this.encryptionService.decrypt({
              content_ciphertext: message.content_ciphertext,
              content_iv: message.content_iv,
              content_auth_tag: message.content_auth_tag,
            }),
          );
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { data, total, page, limit };
  }

  async markRead(userId: string, conversationId: string, ctx: Ctx) {
    const participant = await this.assertActiveParticipant(conversationId, userId, ctx);
    participant.last_read_at = new Date();
    await this.participantRepo.save(participant);
    return { success: true, last_read_at: participant.last_read_at };
  }

  async addGroupMembers(
    userId: string,
    conversationId: string,
    dto: AddGroupMembersDto,
    ctx: Ctx,
  ) {
    const conversation = await this.getGroupConversation(conversationId, ctx);
    await this.assertAdminOrOwner(conversationId, userId, ctx);

    const memberIds = [...new Set(dto.member_ids || [])].filter((id) => id !== userId);
    if (memberIds.length === 0) {
      throw new BadRequestException('member_ids is required.');
    }

    const activeCount = await this.participantRepo.count({
      where: { conversation_id: conversationId, left_at: IsNull(), ...ctx },
    });
    if (activeCount + memberIds.length > MAX_GROUP_MEMBERS) {
      throw new BadRequestException(`Group cannot exceed ${MAX_GROUP_MEMBERS} members.`);
    }

    const users = await this.userRepo.find({ where: { id: In(memberIds), ...ctx } });
    if (users.length !== memberIds.length) {
      throw new BadRequestException('One or more users were not found.');
    }

    const saved: SocialConversationParticipant[] = [];
    for (const memberId of memberIds) {
      if (await this.isBlocked(userId, memberId, ctx)) {
        throw new ForbiddenException(`Cannot add blocked user ${memberId}.`);
      }

      const existing = await this.participantRepo.findOne({
        where: { conversation_id: conversationId, user_id: memberId, ...ctx },
      });

      if (existing) {
        if (!existing.left_at) continue;
        existing.left_at = null;
        existing.role = ParticipantRole.MEMBER;
        saved.push(await this.participantRepo.save(existing));
        continue;
      }

      saved.push(
        await this.participantRepo.save(
          this.participantRepo.create({
            conversation_id: conversationId,
            user_id: memberId,
            role: ParticipantRole.MEMBER,
            ...ctx,
          }),
        ),
      );
    }

    await this.publishConversationEvent(ctx, conversationId, 'member.joined', {
      conversation_id: conversationId,
      member_ids: saved.map((p) => p.user_id),
    });

    return { added: saved.map((p) => p.user_id) };
  }

  async removeParticipant(
    actorId: string,
    conversationId: string,
    targetUserId: string,
    ctx: Ctx,
  ) {
    const conversation = await this.getGroupConversation(conversationId, ctx);

    if (actorId !== targetUserId) {
      await this.assertAdminOrOwner(conversationId, actorId, ctx);
    }

    const target = await this.participantRepo.findOne({
      where: {
        conversation_id: conversationId,
        user_id: targetUserId,
        left_at: IsNull(),
        ...ctx,
      },
    });
    if (!target) {
      throw new NotFoundException('Participant not found.');
    }

    if (target.role === ParticipantRole.OWNER && actorId !== targetUserId) {
      throw new ForbiddenException('Cannot remove the group owner.');
    }

    if (target.role === ParticipantRole.OWNER && actorId === targetUserId) {
      throw new BadRequestException('Transfer ownership before leaving the group.');
    }

    target.left_at = new Date();
    await this.participantRepo.save(target);

    await this.publishConversationEvent(ctx, conversationId, 'member.left', {
      conversation_id: conversation.id,
      user_id: targetUserId,
    });

    return { success: true };
  }

  async updateParticipantRole(
    actorId: string,
    conversationId: string,
    targetUserId: string,
    dto: UpdateParticipantRoleDto,
    ctx: Ctx,
  ) {
    await this.getGroupConversation(conversationId, ctx);
    const actor = await this.assertAdminOrOwner(conversationId, actorId, ctx);

    if (actor.role !== ParticipantRole.OWNER) {
      throw new ForbiddenException('Only the group owner can change roles.');
    }

    const target = await this.participantRepo.findOne({
      where: {
        conversation_id: conversationId,
        user_id: targetUserId,
        left_at: IsNull(),
        ...ctx,
      },
    });
    if (!target) {
      throw new NotFoundException('Participant not found.');
    }
    if (target.role === ParticipantRole.OWNER) {
      throw new BadRequestException('Cannot change the owner role.');
    }

    target.role = dto.role;
    await this.participantRepo.save(target);

    await this.publishConversationEvent(ctx, conversationId, 'member.role_updated', {
      conversation_id: conversationId,
      user_id: targetUserId,
      role: dto.role,
    });

    return { user_id: targetUserId, role: target.role };
  }

  async deleteMessage(userId: string, messageId: string, ctx: Ctx) {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(messageId);
    } catch {
      throw new NotFoundException('Message not found.');
    }

    const message = await this.messageRepo.findOne({
      where: { id: objectId, ...ctx } as Record<string, unknown>,
    });
    if (!message || message.is_deleted) {
      throw new NotFoundException('Message not found.');
    }
    if (message.sender_id !== userId) {
      throw new ForbiddenException('You can only delete your own messages.');
    }

    await this.assertActiveParticipant(message.conversation_id, userId, ctx);

    message.is_deleted = true;
    await this.messageRepo.save(message);

    await this.publishConversationEvent(ctx, message.conversation_id, 'message.deleted', {
      message_id: messageId.toString(),
      conversation_id: message.conversation_id,
    });

    return { success: true };
  }

  private buildDirectPairKey(userA: string, userB: string): string {
    return [userA, userB].sort().join(':');
  }

  private async isBlocked(userA: string, userB: string, ctx: Ctx): Promise<boolean> {
    const block = await this.connectionRepo.findOne({
      where: [
        {
          requester_id: userA,
          addressee_id: userB,
          type: ConnectionType.BLOCK,
          ...ctx,
        },
        {
          requester_id: userB,
          addressee_id: userA,
          type: ConnectionType.BLOCK,
          ...ctx,
        },
      ],
    });
    return Boolean(block);
  }

  private async assertActiveParticipant(
    conversationId: string,
    userId: string,
    ctx: Ctx,
  ): Promise<SocialConversationParticipant> {
    const participant = await this.participantRepo.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
        left_at: IsNull(),
        ...ctx,
      },
    });
    if (!participant) {
      throw new ForbiddenException('You are not a participant of this conversation.');
    }
    return participant;
  }

  private async assertAdminOrOwner(
    conversationId: string,
    userId: string,
    ctx: Ctx,
  ): Promise<SocialConversationParticipant> {
    const participant = await this.assertActiveParticipant(conversationId, userId, ctx);
    if (
      participant.role !== ParticipantRole.ADMIN &&
      participant.role !== ParticipantRole.OWNER
    ) {
      throw new ForbiddenException('Admin permissions required.');
    }
    return participant;
  }

  private async getGroupConversation(conversationId: string, ctx: Ctx): Promise<SocialConversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, type: ConversationType.GROUP, ...ctx },
    });
    if (!conversation) {
      throw new BadRequestException('Group conversation required.');
    }
    return conversation;
  }

  private async populateProfiles(userIds: string[], ctx: Ctx) {
    const uniqueIds = [...new Set(userIds)];
    const profiles = await this.profileRepo.find({
      where: { user_id: In(uniqueIds), ...ctx },
    });
    const users = await this.userRepo.find({
      where: { id: In(uniqueIds), ...ctx },
    });

    const map = new Map<string, { id: string; display_name: string; avatar_url: string }>();
    uniqueIds.forEach((id) => {
      const profile = profiles.find((p) => p.user_id === id);
      const user = users.find((u) => u.id === id);
      map.set(id, {
        id,
        display_name: user?.display_name || '',
        avatar_url: profile?.avatar_url || '',
      });
    });
    return map;
  }

  private mapMessage(message: SocialMessage, content: string) {
    return {
      id: message.id.toString(),
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      message_type: message.message_type,
      content,
      metadata: message.metadata,
      is_deleted: message.is_deleted,
      created_at: message.created_at,
    };
  }

  private async publishConversationEvent(
    ctx: Ctx,
    conversationId: string,
    event: string,
    payload: Record<string, string | number | boolean | null | object>,
  ) {
    await this.socketClient.publish({
      tenant_key: ctx.tenant_key,
      app_key: ctx.app_key,
      channel: this.socketClient.conversationChannel(conversationId),
      event,
      payload,
    });
  }
}
