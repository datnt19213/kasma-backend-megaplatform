import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLearningPoint } from '@/entities/learning/user-learning-point.entity';

export enum XPTrigger {
  LESSON_COMPLETE = 50,
  QUIZ_PASS = 100,
  FORUM_POST = 10,
  DAILY_LOGIN = 5,
}

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserLearningPoint, 'postgres')
    private readonly pointRepo: Repository<UserLearningPoint>,
  ) {}

  async awardXP(userId: string, amount: number, ctx: { app_key: string; tenant_key: string }) {
    let userPoint = await this.pointRepo.findOne({ where: { user_id: userId, ...ctx } });

    if (!userPoint) {
      userPoint = this.pointRepo.create({
        user_id: userId,
        points: amount,
        level: 1,
        ...ctx,
      });
    } else {
      userPoint.points += amount;
      // Simple leveling logic: level = floor(sqrt(points / 100)) + 1
      userPoint.level = Math.floor(Math.sqrt(userPoint.points / 100)) + 1;
      userPoint.last_earned_at = new Date();
    }

    return await this.pointRepo.save(userPoint);
  }

  async getLeaderboard(ctx: { app_key: string; tenant_key: string }, limit = 10) {
    return await this.pointRepo.find({
      where: { ...ctx },
      order: { points: 'DESC' },
      take: limit,
    });
  }

  async getUserRank(userId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.pointRepo.findOne({ where: { user_id: userId, ...ctx } });
  }
}
