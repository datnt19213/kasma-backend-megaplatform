import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailOtpHtml } from 'src/lib/mail.otp-html';

import { convertCase } from '@/utils/convert-text';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        @InjectQueue('mail-queue') private mailQueue: Queue,
        private configService: ConfigService
    ) {}

    async sendOtpEmail(to: string, otp: string, type: string) {
        const fromEmail = this.configService.get('MAIL_FROM_EMAIL');
        if (!fromEmail || !this.configService.get('MAIL_USER')) {
            console.warn('Mail configuration is missing. OTP will only be logged to console.');
            console.log(`[DEV] OTP for ${to}: ${otp} (Type: ${type})`);
            return;
        }

        const subject = `[Kasma] Your verification code for ${convertCase(type, "title")}`;
        const html = MailOtpHtml(otp, convertCase(type, "title"));

        // Push to BullMQ queue instead of awaiting the heavy nodemailer call
        await this.mailQueue.add(
            'send-otp',
            { to, subject, html, otp, type },
            { attempts: 3, backoff: { type: 'exponential', delay: 3000 } }
        );
        console.log(`[Queue] Added send-otp job for ${to}`);
    }
}
