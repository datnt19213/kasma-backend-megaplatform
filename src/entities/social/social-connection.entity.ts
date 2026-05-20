import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum ConnectionType {
  FOLLOW = 'FOLLOW',
  FRIEND = 'FRIEND',
  BLOCK = 'BLOCK',
}

export enum ConnectionStatus {
  PENDING = 'PENDING',   // Friend request sent, awaiting response
  ACCEPTED = 'ACCEPTED', // Friend request accepted
  REJECTED = 'REJECTED', // Friend request rejected
  ACTIVE = 'ACTIVE',     // Follow or Block is immediately active
}

@Entity('social_connections')
@Index(['requester_id', 'addressee_id', 'type', 'app_key', 'tenant_key'], { unique: true })
@Index(['addressee_id', 'type', 'status', 'app_key', 'tenant_key'])
export class SocialConnection extends MultiTenantEntity {
  @Column()
  requester_id: string;

  @Column()
  addressee_id: string;

  @Column({
    type: 'enum',
    enum: ConnectionType,
  })
  type: ConnectionType;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;
}
