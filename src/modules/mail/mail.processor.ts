import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    super();
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

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-otp':
        await this.handleSendOtp(job.data);
        break;
      default:
        console.warn(`[MailProcessor] Unknown job name: ${job.name}`);
    }
  }

  private async handleSendOtp(data: { to: string; subject: string; html: string; otp: string; type: string }) {
    const fromEmail = this.configService.get('MAIL_FROM_EMAIL');
    const fromName = this.configService.get('MAIL_FROM_NAME') || 'Kasma';
    
    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
      console.log(`[MailProcessor] Successfully sent OTP to ${data.to}`);
    } catch (error) {
      console.error(`[MailProcessor] Error sending email to ${data.to}:`, error);
      console.log(`[DEV-FALLBACK] OTP for ${data.to}: ${data.otp} (Type: ${data.type})`);
      throw error; // Throwing error puts job in failed state or triggers retry
    }
  }
}
