import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateNotificationDto {
  title?: string;
  content?: string;
  type?: string;
  userId: string;
  templateId?: string;
  metadata?: Record<string, string | number | boolean | null>;
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
      const response = await fetch(`${this.notiServiceUrl}/api/notification/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Kasma-Id': tenantKey,
          'X-App-Kasma-Id': appKey,
          'X-User-Id': data.userId,
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type || 'IN_APP',
          userId: data.userId,
          templateId: data.templateId,
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Failed to send notification: ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Error sending notification: ${message}`);
      return false;
    }
  }
}
