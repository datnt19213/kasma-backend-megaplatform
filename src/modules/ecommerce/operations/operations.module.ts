import { RMAInspection } from '@/entities/mongo/rma-inspection.mongo-entity';
// Mongo Entities
import {
  TicketConversation,
} from '@/entities/mongo/ticket-conversation.mongo-entity';
import { CreditMemo } from '@/entities/operations/credit-memo.entity';
// Postgres Entities
import { ProductReview } from '@/entities/operations/product-review.entity';
import { ReturnRequest } from '@/entities/operations/return-request.entity';
import { SupportTicket } from '@/entities/operations/support-ticket.entity';
import {
  RefundController,
} from '@/modules/ecommerce/operations/refund/refund.controller';
import {
  RefundService,
} from '@/modules/ecommerce/operations/refund/refund.service';
// Controllers
import {
  ReviewController,
} from '@/modules/ecommerce/operations/review/review.controller';
// Sub-modules
import {
  ReviewService,
} from '@/modules/ecommerce/operations/review/review.service';
import {
  RMAController,
} from '@/modules/ecommerce/operations/rma/rma.controller';
import { RMAService } from '@/modules/ecommerce/operations/rma/rma.service';
import {
  SupportController,
} from '@/modules/ecommerce/operations/support/support.controller';
import {
  SupportService,
} from '@/modules/ecommerce/operations/support/support.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Shared
import { FinanceModule } from '../finance/finance.module';
import { LogisticsModule } from '../logistics/logistics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReview,
      ReturnRequest,
      CreditMemo,
      SupportTicket,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      TicketConversation,
      RMAInspection,
    ], 'mongo'),
    FinanceModule,
    LogisticsModule,
  ],
  controllers: [
    ReviewController,
    RMAController,
    RefundController,
    SupportController,
  ],
  providers: [
    ReviewService,
    RMAService,
    RefundService,
    SupportService,
  ],
  exports: [
    ReviewService,
    RMAService,
    RefundService,
    SupportService,
  ],
})
export class OperationsModule { }
