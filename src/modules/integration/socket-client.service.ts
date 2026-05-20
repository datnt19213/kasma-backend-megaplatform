import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SocketPublishPayload {
  tenant_key: string;
  app_key: string;
  channel: string;
  event: string;
  payload: Record<string, string | number | boolean | null | object>;
}

@Injectable()
export class SocketClientService {
  private readonly logger = new Logger(SocketClientService.name);
  private readonly socketServiceUrl: string;
  private readonly internalApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.socketServiceUrl =
      this.configService.get<string>('SOCKET_SERVICE_URL') ||
      process.env.SOCKET_SERVICE_URL ||
      'http://localhost:5010';
    this.internalApiKey =
      this.configService.get<string>('SOCKET_INTERNAL_API_KEY') ||
      process.env.SOCKET_INTERNAL_API_KEY ||
      'kasma-socket-internal-dev-key';
  }

  conversationChannel(conversationId: string): string {
    return `chat:conversation:${conversationId}`;
  }

  userNoticeChannel(userId: string): string {
    return `notice:user:${userId}`;
  }

  async publish(event: SocketPublishPayload): Promise<boolean> {
    try {
      const response = await fetch(`${this.socketServiceUrl}/api/socket/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Api-Key': this.internalApiKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        this.logger.error(`Socket publish failed: ${response.status} ${response.statusText}`);
        return false;
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Socket publish error: ${message}`);
      return false;
    }
  }
}
