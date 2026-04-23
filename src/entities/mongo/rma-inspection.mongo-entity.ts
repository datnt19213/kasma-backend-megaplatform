import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

@Entity('RMAInspection')
export class RMAInspection {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  returnRequestId: string;

  @Column({ type: 'json' })
  findings: {
    itemName: string;
    condition: 'EXCELLENT' | 'GOOD' | 'DAMAGED' | 'WRONG_ITEM';
    notes: string;
    photos: string[];
  }[];

  @Column({ default: false })
  restocked: boolean;

  @CreateDateColumn()
  created_at: Date;
}
