import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrderManagementService } from './order-management/order-management.service';

@Processor('sales-queue')
export class SalesProcessor extends WorkerHost {
  private readonly logger = new Logger(SalesProcessor.name);

  constructor(
    private readonly orderService: OrderManagementService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing sales job: ${job.name}`);

    switch (job.name) {
      case 'order-confirmation':
        return this.handleOrderConfirmation(job.data);
      case 'stock-sync':
        return this.handleStockSync(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleOrderConfirmation(data: { orderId: string; userId: string }) {
    this.logger.log(`Sending order confirmation for order: ${data.orderId}`);
    return { success: true, orderId: data.orderId };
  }

  private async handleStockSync(data: { productId: string; variantId?: string }) {
    this.logger.log(`Syncing stock for product: ${data.productId}`);
    return { success: true, productId: data.productId };
  }
}
