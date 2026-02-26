import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET || 'gdTzoE4Ybram1gI5bI20laJkYZLgQSBBTOMb4OIWqvqvnkTLyf',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    tokenLength: 64, // 50-100 ký tự
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        accessTokenMaxAge: 30 * 60 * 1000, // 30m
        refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    },
}));
