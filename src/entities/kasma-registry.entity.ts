import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('KasmaRegistry')
@Index(['app_key', 'tenant_key', 'module_key'], { unique: true })
export class KasmaRegistry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  module_key: string;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
