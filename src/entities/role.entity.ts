import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Role')
@Index(['code'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    code: string; // ADMIN, KADMIN, MANAGER

    @Column({ length: 255 })
    name: string;

    @Column({ default: false })
    is_kasma_role: boolean;

    @Column({ nullable: true })
    description: string;
}
