import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

@Entity('user_profiles')
@Index(['user_id', 'app_key', 'tenant_key'], { unique: true })
export class UserProfile extends MultiTenantEntity {
  @Column({ unique: true })
  user_id: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({
    type: 'enum',
    enum: GenderType,
    nullable: true,
  })
  gender: GenderType;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  avatar_provider: string; // KEDIA or CLOUDINARY

  @Column({ nullable: true })
  cover_url: string;

  @Column({ nullable: true })
  cover_provider: string; // KEDIA or CLOUDINARY

  @Column('simple-array', { nullable: true })
  interests: string[]; // Used for Discovery suggestions

  @Column({ default: false })
  is_private: boolean;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @Column({ type: 'int', default: 0 })
  following_count: number;

  @Column({ type: 'int', default: 0 })
  friend_count: number;
}
