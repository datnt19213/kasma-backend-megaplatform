import * as nodemailer from 'nodemailer';
import { MailOtpHtml } from 'src/lib/mail.otp-html';

import { convertCase } from '@/utils/convert-text';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get('MAIL_PORT'),
            secure: this.configService.get('MAIL_SECURE') === 'true',
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASS'),
            },
        });
    }

    async sendOtpEmail(to: string, otp: string, type: string) {
        const fromEmail = this.configService.get('MAIL_FROM_EMAIL');
        if (!fromEmail || !this.configService.get('MAIL_USER')) {
            console.warn('Mail configuration is missing. OTP will only be logged to console.');
            console.log(`[DEV] OTP for ${to}: ${otp} (Type: ${type})`);
            return;
        }

        const subject = `[Kasma] Your verification code for ${convertCase(type, "title")}`;
        const html = MailOtpHtml(otp, convertCase(type, "title"));

        try {
            await this.transporter.sendMail({
                from: `"${this.configService.get('MAIL_FROM_NAME') || 'Kasma'}" <${fromEmail}>`,
                to,
                subject,
                html,
            });
            console.log(`Email sent to ${to} with OTP ${otp}`);
        } catch (error) {
            console.error('Error sending email:', error);
            // In development, still log the OTP so we can proceed
            console.log(`[DEV-FALLBACK] OTP for ${to}: ${otp}`);
        }
    }
}
