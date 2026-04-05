import { Column, Entity, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { User } from '../user.entity';

@Entity('affiliate_links')
export class AffiliateLink extends MultiTenantEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ name: 'program_id' })
  programId: string;

  @Column({ unique: true })
  code: string; // The affiliate code

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
