import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('AuditAuthLog')
export class AuditAuthLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column()
  action: string;

  @Column()
  target: string;

  @Column({ nullable: true })
  metadata: string;

  @CreateDateColumn()
  created_at: Date;
}
