import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import {
  UserStatus,
  UserType,
} from '@/config/apps';

export class UpdateProfileDto {

    @IsOptional()
    @IsString()
    display_name?: string;

    @IsOptional()
    @IsString()
    background_url?: string;

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsDateString()
    date_of_birth?: string | Date;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    social_links?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notification_preferences?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    privacy_settings?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    security_settings?: string[];

    @IsOptional()
    @IsString()
    subscription_status?: string;

    @IsOptional()
    @IsString()
    subscription_plan?: string;

    @IsOptional()
    @IsDateString()
    subscription_start_date?: string | Date;

    @IsOptional()
    @IsDateString()
    subscription_end_date?: string | Date;

    @IsOptional()
    @IsDateString()
    subscription_trial_end_date?: string | Date;

    @IsOptional()
    @IsBoolean()
    subscription_cancel_at_period_end?: boolean;

    @IsOptional()
    @IsDateString()
    subscription_cancel_at?: string | Date;

    @IsOptional()
    @IsDateString()
    subscription_canceled_at?: string | Date;

    @IsOptional()
    @IsDateString()
    subscription_current_period_start?: string | Date;

    @IsOptional()
    @IsDateString()
    subscription_current_period_end?: string | Date;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    current_password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'New password must be at least 6 characters' })
    new_password: string;
}

export class AdminUpdateUserDto {
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsBoolean()
    is_locked?: boolean;

    @IsOptional()
    @IsEnum(UserType)
    user_type?: UserType;
}

export class AssignRoleDto {
    @IsNotEmpty()
    @IsUUID()
    role_id: string;
}

export class DeleteUserDto {
    @IsNotEmpty()
    @IsUUID()
    user_id: string;
}
