import {
  Column,
  Entity,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('product_tags')
export class ProductTag extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;
}
