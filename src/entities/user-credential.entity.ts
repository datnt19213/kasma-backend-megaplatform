import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('UserCredential')
@Index(['user_id'])
export class UserCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  password_salt: string;

  @Column({ nullable: true })
  provider: string; // local, google, github

  @Column({ nullable: true })
  provider_id: string;

  @Column({ default: true })
  is_active: boolean;
}
