import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
    @IsNotEmpty({ message: 'Email or username is required' })
    @IsString()
    identifier: string; // email hoặc username

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}

export class RegisterDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @IsOptional()
    @IsString()
    display_name?: string;

    @IsOptional()
    @IsBoolean()
    is_login_after_registration_success?: boolean;
}

export class RefreshTokenDto {
    @IsNotEmpty({ message: 'Refresh token is required' })
    @IsString()
    refresh_token: string;
}

export class GetLoginLogsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    user_id?: string;

    @IsOptional()
    @IsString()
    action?: string; // LOGIN_SUCCESS, LOGIN_FAILED, etc.
}

export class LoginLogResponseDto {
    id: string;
    user_id: string | null;
    action: string;
    target: string;
    metadata: Record<string, any> | null;
    created_at: Date;
}

export class LoginLogsResponseDto {
    success: boolean;
    data: LoginLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
