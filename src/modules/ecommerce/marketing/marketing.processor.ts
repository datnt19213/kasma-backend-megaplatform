import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AbandonedCartService } from './abandoned-cart/abandoned-cart.service';
import { MailService } from '../../mail/mail.service';

@Processor('marketing-queue')
export class MarketingProcessor extends WorkerHost {
  private readonly logger = new Logger(MarketingProcessor.name);

  constructor(
    private readonly abandonedCartService: AbandonedCartService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing marketing job: ${job.name}`);

    switch (job.name) {
      case 'abandoned-cart-notification':
        return this.handleAbandonedCart(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleAbandonedCart(data: { userId: string; items: any[] }) {
    this.logger.log(`Sending abandoned cart notification to user: ${data.userId}`);
    // In a real app, you'd lookup user's email and send a nice HTML template
    // For now, we'll just log and potentially use MailService
    return { success: true, userId: data.userId };
  }
}
