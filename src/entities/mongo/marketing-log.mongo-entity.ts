import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

export enum MarketingLogType {
  PROMOTION_USAGE = 'promotion_usage',
  COUPON_REDEMPTION = 'coupon_redemption',
  AFFILIATE_CLICK = 'affiliate_click',
  AFFILIATE_CONVERSION = 'affiliate_conversion',
  LOYALTY_AUDIT = 'loyalty_audit',
}

@Entity('MarketingLogs')
export class MarketingLog {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ name: 'log_type', type: 'enum', enum: MarketingLogType })
  logType: MarketingLogType;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string; // PromotionId, CouponId, etc.

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
