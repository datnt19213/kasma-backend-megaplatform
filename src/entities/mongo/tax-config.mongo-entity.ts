import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TaxConfig')
export class TaxConfig {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ default: 'exclusive' })
  calculationType: 'inclusive' | 'exclusive';

  @Column({ default: 'half_up' })
  roundingMode: 'half_up' | 'half_down' | 'floor' | 'ceil';

  @Column({ type: 'json', nullable: true })
  regionalOverrides: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
