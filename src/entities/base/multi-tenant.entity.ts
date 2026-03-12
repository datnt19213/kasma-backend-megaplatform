import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class MultiTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_key', length: 255, default: 'MASTER', nullable: true })
  app_key: string;

  @Column({ name: 'tenant_key', length: 255, default: 'MASTER', nullable: true })
  tenant_key: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
