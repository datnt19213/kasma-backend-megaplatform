import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('App')
@Index(['app_key'], { unique: true })
export class App {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    app_key: string;

    @Column()
    name: string;

    @Column()
    tenant_key: string;

    @Column({ default: true })
    is_active: boolean;
}
