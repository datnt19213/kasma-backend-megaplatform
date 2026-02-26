import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('RolePermission')
@Index(['role_id', 'permission_id'], { unique: true })
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    role_id: string;

    @Column('uuid')
    permission_id: string;
}
