import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('InventoryBuffer')
export class InventoryBuffer {
  @ObjectIdColumn()
  id: ObjectId;

  @ObjectIdColumn({ name: '_id_str', transformer: { to: (v) => v, from: (v) => v } })
  _id_string: string;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  product_id: string;

  @Column({ default: 0 })
  buffer_quantity: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
