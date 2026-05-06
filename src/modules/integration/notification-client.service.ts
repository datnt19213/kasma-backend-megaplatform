import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateNotificationDto {
  title?: string;
  content?: string;
  type?: string;
  userId: string;
  templateId?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  priority?: string;
}

@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly notiServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.notiServiceUrl = this.configService.get<string>('NOTI_SERVICE_URL') || 'http://localhost:3004';
  }

  async sendNotification(
    tenantKey: string,
    appKey: string,
    data: CreateNotificationDto
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.notiServiceUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant_key': tenantKey,
          'app_key': appKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        this.logger.error(`Failed to send notification: ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      return false;
    }
  }
}
