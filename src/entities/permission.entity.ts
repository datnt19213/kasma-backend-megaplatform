import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Permission')
@Index(['code'], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 150 })
    code: string; // user.create, app.delete

    @Column({ length: 255 })
    description: string;
}
