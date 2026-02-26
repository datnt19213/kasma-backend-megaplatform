import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('UserContext')
export class UserContext {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column()
    tenant_key: string;

    @Column()
    app_key: string;

    @Column()
    owned_key: string;
}
