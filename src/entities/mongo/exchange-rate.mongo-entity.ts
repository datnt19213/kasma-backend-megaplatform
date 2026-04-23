import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ExchangeRate')
export class ExchangeRate {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  fromCurrency: string; // e.g., "USD"

  @Column()
  toCurrency: string; // e.g., "VND"

  @Column({ type: 'decimal' })
  rate: number;

  @Column({ nullable: true })
  provider: string; // e.g., "Fixer.io", "Manual"

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
