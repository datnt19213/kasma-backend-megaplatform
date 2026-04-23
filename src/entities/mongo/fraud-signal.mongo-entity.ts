import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

@Entity('fraud_signals')
export class FraudSignal {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @Column()
  vendorId: string;

  @Column()
  riskScore: number; // 0 to 100

  @Column('simple-array')
  flags: string[]; // e.g. ['NEW_USER_HIGH_VALUE', 'LOCATION_MISMATCH', 'BOM_HISTORY']

  @Column({ type: 'json' })
  evidence: any;

  @CreateDateColumn()
  created_at: Date;
}
