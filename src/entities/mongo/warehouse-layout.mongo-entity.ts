import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('WarehouseLayout')
export class WarehouseLayout {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  warehouse_id: string;

  @Column({ type: 'json' })
  zones: {
    name: string;
    racks: {
      id: string;
      levels: string[];
    }[];
  }[];

  @Column({ type: 'json', nullable: true })
  picking_optimization_rules: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
