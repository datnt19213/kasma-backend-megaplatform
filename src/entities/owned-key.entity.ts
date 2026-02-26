import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('OwnedKey')
@Index(['owned_key'], { unique: true })
export class OwnedKey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    owned_key: string;

    @Column()
    tenant_key: string;

    @Column()
    app_key: string;

    @Column({ default: true })
    is_active: boolean;
}
