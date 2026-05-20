import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SocialConnection } from '@/entities/social/social-connection.entity';
import { UserProfile } from '@/entities/social/user-profile.entity';
import { UserActivityLog } from '@/entities/mongo/user-activity-log.mongo-entity';
import { SocialPost } from '@/entities/social/social-post.entity';
import { SocialStory } from '@/entities/social/social-story.entity';
import { SocialPostMedia } from '@/entities/mongo/social-post-media.mongo-entity';
import { SocialPostTag } from '@/entities/mongo/social-post-tag.mongo-entity';
import { SocialReaction } from '@/entities/social/social-reaction.entity';
import { SocialComment } from '@/entities/social/social-comment.entity';
import { SocialMention } from '@/entities/mongo/social-mention.mongo-entity';
import { SocialConversation } from '@/entities/social/social-conversation.entity';
import { SocialConversationParticipant } from '@/entities/social/social-conversation-participant.entity';
import { SocialMessage } from '@/entities/mongo/social-message.mongo-entity';
import { SocialGroup } from '@/entities/social/social-group.entity';
import { SocialGroupMember } from '@/entities/social/social-group-member.entity';
import { SocialNotice } from '@/entities/social/social-notice.entity';

import { ConnectionService } from './connection/connection.service';
import { ConnectionController } from './connection/connection.controller';
import { ProfileService } from './profile/profile.service';
import { ProfileController } from './profile/profile.controller';
import { DiscoveryService } from './discovery/discovery.service';
import { DiscoveryController } from './discovery/discovery.controller';
import { PostService } from './post/post.service';
import { PostController } from './post/post.controller';
import { StoryService } from './story/story.service';
import { StoryController } from './story/story.controller';
import { NewsfeedService } from './newsfeed/newsfeed.service';
import { NewsfeedController } from './newsfeed/newsfeed.controller';
import { ReactionService } from './reaction/reaction.service';
import { ReactionController } from './reaction/reaction.controller';
import { CommentService } from './comment/comment.service';
import { CommentController } from './comment/comment.controller';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingService } from './messaging/messaging.service';
import { MessageEncryptionService } from './messaging/message-encryption.service';
import { GroupController } from './group/group.controller';
import { GroupService } from './group/group.service';
import { NoticeController } from './notice/notice.controller';
import { NoticeService } from './notice/notice.service';
import { TrendingController } from './trending/trending.controller';
import { TrendingService } from './trending/trending.service';
import { HashtagIndexService } from './trending/hashtag-index.service';
import { User } from '@/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        SocialConnection,
        UserProfile,
        SocialPost,
        SocialStory,
        SocialReaction,
        SocialComment,
        SocialConversation,
        SocialConversationParticipant,
        SocialGroup,
        SocialGroupMember,
        SocialNotice,
        User,
      ],
      'postgres',
    ),
    TypeOrmModule.forFeature(
      [UserActivityLog, SocialPostMedia, SocialPostTag, SocialMention, SocialMessage],
      'mongo',
    ),
  ],
  controllers: [
    ConnectionController,
    ProfileController,
    DiscoveryController,
    PostController,
    StoryController,
    NewsfeedController,
    ReactionController,
    CommentController,
    MessagingController,
    GroupController,
    NoticeController,
    TrendingController,
  ],
  providers: [
    ConnectionService,
    ProfileService,
    DiscoveryService,
    PostService,
    StoryService,
    NewsfeedService,
    ReactionService,
    CommentService,
    MessagingService,
    MessageEncryptionService,
    GroupService,
    NoticeService,
    TrendingService,
    HashtagIndexService,
  ],
  exports: [ProfileService],
})
export class SocialModule {}
