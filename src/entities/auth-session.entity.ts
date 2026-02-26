import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('AuthSession')
export class AuthSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  access_token: string;

  @Column()
  refresh_token: string;

  @Column()
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  expires_at: Date;
}
