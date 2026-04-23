import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionBridgeService {
  private readonly transactionUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Port 3003 defined in kasma-transaction README/docker-compose
    this.transactionUrl = this.configService.get('TRANSACTION_SERVICE_URL', 'http://localhost:3003');
  }

  async initiateExternalPayment(dto: {
    orderId: string;
    amount: number;
    provider: 'STRIPE' | 'PAYPAL' | 'COD';
    returnUrl: string;
  }) {
    try {
      const response = await fetch(`${this.transactionUrl}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      return await response.json();
    } catch (err) {
      console.error('[TransactionBridge] Error:', err.message);
      throw new InternalServerErrorException('Payment gateway communication failure');
    }
  }

  async refundPayment(dto: {
    transactionId: string;
    amount: number;
    reason?: string;
  }) {
    try {
      const response = await fetch(`${this.transactionUrl}/api/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process refund');
      }

      return await response.json();
    } catch (err) {
      console.error('[TransactionBridge Refund] Error:', err.message);
      throw new InternalServerErrorException('Payment gateway refund failure');
    }
  }

  async processPayout(dto: {
    amount: number;
    currency: string;
    destination: string;
    provider: string;
  }) {
    try {
      const response = await fetch(`${this.transactionUrl}/api/payment/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payout');
      }

      return await response.json();
    } catch (err) {
      console.error('[TransactionBridge Payout] Error:', err.message);
      throw new InternalServerErrorException('Payment gateway payout failure');
    }
  }
}
