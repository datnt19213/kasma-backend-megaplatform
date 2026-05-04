import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCourse } from '@/entities/learning/learning-course.entity';
import { LearningChapter } from '@/entities/learning/learning-chapter.entity';
import { LearningLesson } from '@/entities/learning/learning-lesson.entity';
import { LearningEnrollment } from '@/entities/learning/learning-enrollment.entity';
import { LearningProgress } from '@/entities/learning/learning-progress.entity';
import { LearningAssessment } from '@/entities/learning/learning-assessment.entity';
import { LearningAttempt } from '@/entities/learning/learning-attempt.entity';
import { LearningMaterial } from '@/entities/mongo/learning-material.mongo-entity';
import { LearningNote } from '@/entities/mongo/learning-note.mongo-entity';
import { LearningQuestion } from '@/entities/mongo/learning-question.mongo-entity';
import { LearningSubmission } from '@/entities/mongo/learning-submission.mongo-entity';
import { LearningCertificate } from '@/entities/learning/learning-certificate.entity';
import { LearningBadge } from '@/entities/learning/learning-badge.entity';
import { UserBadge } from '@/entities/learning/user-badge.entity';
import { LearningLiveSession } from '@/entities/learning/learning-live-session.entity';
import { LearningAnnouncement } from '@/entities/learning/learning-announcement.entity';
import { LearningForumThread } from '@/entities/mongo/learning-forum-thread.mongo-entity';
import { LearningForumComment } from '@/entities/mongo/learning-forum-comment.mongo-entity';
import { LearningPath } from '@/entities/learning/learning-path.entity';
import { LearningPathCourse } from '@/entities/learning/learning-path-course.entity';
import { UserLearningPoint } from '@/entities/learning/user-learning-point.entity';
import { LearningScormPackage } from '@/entities/learning/learning-scorm.entity';
import { CourseManagementService } from './course/course-management.service';
import { CurriculumService } from './course/curriculum.service';
import { MaterialService } from './course/material.service';
import { LearningExperienceService } from './player/learning-experience.service';
import { NoteTakingService } from './player/note-taking.service';
import { AssessmentService } from './assessment/assessment.service';
import { GradingService } from './assessment/grading.service';
import { CertificateService } from './credential/certificate.service';
import { ForumService } from './interaction/forum.service';
import { OperationService } from './operation/operation.service';
import { ReportingService } from './reporting/reporting.service';
import { GamificationService } from './advanced/gamification.service';
import { ScormService } from './advanced/scorm.service';
import { CourseController } from './course/course.controller';
import { CurriculumController } from './course/curriculum.controller';
import { LearningPlayerController } from './player/learning-player.controller';
import { AssessmentController } from './assessment/assessment.controller';
import { CredentialController } from './credential/credential.controller';
import { InteractionController } from './interaction/interaction.controller';
import { OperationController } from './operation/operation.controller';
import { ReportingController } from './reporting/reporting.controller';
import { AdvancedController } from './advanced/advanced.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningCourse, LearningChapter, LearningLesson, LearningEnrollment, LearningProgress,
      LearningAssessment, LearningAttempt, LearningCertificate, LearningBadge, UserBadge,
      LearningLiveSession, LearningAnnouncement, LearningPath, LearningPathCourse,
      UserLearningPoint, LearningScormPackage
    ], 'postgres'),
    TypeOrmModule.forFeature([
      LearningMaterial, LearningNote, LearningQuestion, LearningSubmission,
      LearningForumThread, LearningForumComment
    ], 'mongo'),
    MediaModule,
  ],
  controllers: [
    CourseController,
    CurriculumController,
    LearningPlayerController,
    AssessmentController,
    CredentialController,
    InteractionController,
    OperationController,
    ReportingController,
    AdvancedController,
  ],
  providers: [
    CourseManagementService,
    CurriculumService,
    MaterialService,
    LearningExperienceService,
    NoteTakingService,
    AssessmentService,
    GradingService,
    CertificateService,
    ForumService,
    OperationService,
    ReportingService,
    GamificationService,
    ScormService,
  ],
})
export class LearningModule {}
