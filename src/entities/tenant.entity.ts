import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Tenant')
@Index(['tenant_key'], { unique: true })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_key: string;

    @Column()
    name: string;

    @Column({ default: true })
    is_active: boolean;
}
