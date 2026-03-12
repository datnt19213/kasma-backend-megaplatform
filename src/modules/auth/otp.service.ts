import * as crypto from 'crypto';
import {
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';

import {
  Otp,
  OtpChannel,
  OtpType,
} from '@/entities/otp.entity';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MailService } from '../mail/mail.service';

@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otp, 'postgres')
        private otpRepository: Repository<Otp>,
        private mailService: MailService,
    ) { }

    generateCode(length = 6): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    async createAndSendOtp(
        identifier: string,
        type: OtpType,
        userId?: string,
        channel: OtpChannel = OtpChannel.EMAIL,
    ) {
        // Rate limiting: Check for codes sent in the last 60 seconds
        const sixtySecondsAgo = new Date();
        sixtySecondsAgo.setSeconds(sixtySecondsAgo.getSeconds() - 60);

        const recentOtp = await this.otpRepository.findOne({
            where: {
                identifier,
                type,
                created_at: MoreThan(sixtySecondsAgo),
                is_active: true,
            } as any,
        });

        if (recentOtp) {
            throw new BadRequestException('Please wait 60 seconds before requesting a new code');
        }

        // Deactivate all previous OTPs for this identifier and type
        await this.cancelOtps(identifier, type);

        const code = this.generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes TTL

        const otp = this.otpRepository.create({
            user_id: userId,
            identifier,
            code,
            type,
            channel,
            expires_at: expiresAt,
            is_active: true,
            is_verified: false,
        });

        await this.otpRepository.save(otp);

        if (channel === OtpChannel.EMAIL) {
            await this.mailService.sendOtpEmail(identifier, code, type);
        }
        // Future: SMS channel

        return otp;
    }

    async verifyOtp(identifier: string, code: string, type: OtpType): Promise<boolean> {
        const otp = await this.otpRepository.findOne({
            where: {
                identifier,
                code,
                type,
                is_verified: false,
                expires_at: MoreThan(new Date()),
            } as any,
        });

        return !!otp;
    }

    async cancelOtps(identifier: string, type: OtpType) {
        await this.otpRepository.update(
            { identifier, type, is_active: true } as any,
            { is_active: false } as any,
        );
    }

    // Improved verify with cleanup
    async validateAndVerify(identifier: string, code: string, type: OtpType): Promise<Otp | null> {
        const otp = await this.otpRepository.findOne({
            where: {
                identifier,
                code,
                type,
                is_active: true,
                expires_at: MoreThan(new Date()),
            } as any,
            order: { created_at: 'DESC' },
        });

        if (!otp) {
            return null;
        }

        otp.is_verified = true;
        otp.is_active = false;
        await this.otpRepository.save(otp);
        return otp;
    }

    async cleanupExpired() {
        await this.otpRepository.delete({
            expires_at: LessThan(new Date()),
        } as any);
    }
}
