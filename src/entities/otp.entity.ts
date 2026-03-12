import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpType {
    REGISTER = 'REGISTER',
    LOGIN = 'LOGIN',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    TWO_FA = 'TWO_FA',
}

export enum OtpChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
}

@Entity('Otp')
@Index(['user_id'])
@Index(['identifier', 'code'])
export class Otp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    user_id: string;

    @Column({ length: 10 })
    code: string;

    @Column({ type: 'enum', enum: OtpType })
    type: OtpType;

    @Column({ type: 'enum', enum: OtpChannel })
    channel: OtpChannel;

    @Column({ length: 255 })
    identifier: string; // email or phone number

    @Column()
    expires_at: Date;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
