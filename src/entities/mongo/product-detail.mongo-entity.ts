import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ProductDetail')
export class ProductDetail {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  product_id: string; // ID of product in Postgres

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  attributes: { name: string, values: string[] }[];

  @Column({ type: 'json', nullable: true })
  media: { 
    url: string, 
    type: string, 
    is_main: boolean, 
    variant_id?: string,
    sort_order?: number,
    metadata?: Record<string, any>
  }[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
