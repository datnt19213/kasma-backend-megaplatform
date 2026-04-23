import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SettlementService } from './settlement.service';

@Processor('sales-queue')
export class SettlementProcessor extends WorkerHost {
  constructor(private readonly settlementService: SettlementService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'order-settlement') {
      const { orderId, app_key, tenant_key } = job.data;
      await this.settlementService.settleOrder(orderId, { app_key, tenant_key });
    }
  }
}
