import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('UserProfile')
export class UserProfile {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  user_id: string; // Map to Postgres User id

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  background_url: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  social_links: string[];

  @Column({ nullable: true })
  // example data: ["email", "sms", "push"]
  notification_preferences: string[];

  @Column({ nullable: true })
  // example data: ["public", "private"]
  privacy_settings: string[];

  @Column({ nullable: true })
  // example data: ["2fa", "password_change", "login_alert"]
  security_settings: string[];

  @Column({ nullable: true })
  // subscription status
  subscription_status: string;

  @Column({ nullable: true })
  // subscription plan
  subscription_plan: string;

  @Column({ nullable: true })
  // start date of subscription
  subscription_start_date: Date;

  @Column({ nullable: true })
  // end date of subscription
  subscription_end_date: Date;

  @Column({ nullable: true })
  // trial end date of subscription
  subscription_trial_end_date: Date;

  @Column({ nullable: true })
  // if true, subscription will be canceled at the end of the period
  subscription_cancel_at_period_end: boolean;

  @Column({ nullable: true })
  // cancel_at: when user click cancel button
  subscription_cancel_at: Date;

  @Column({ nullable: true })
  // canceled_at: when subscription is canceled
  subscription_canceled_at: Date;


  @Column({ nullable: true })
  // start date of current period of subscription
  subscription_current_period_start: Date;

  @Column({ nullable: true })
  // end date of current period of subscription
  subscription_current_period_end: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
