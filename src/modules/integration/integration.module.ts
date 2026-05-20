import { Global, Module } from '@nestjs/common';
import { NotificationClientService } from './notification-client.service';
import { SocketClientService } from './socket-client.service';

@Global()
@Module({
  providers: [NotificationClientService, SocketClientService],
  exports: [NotificationClientService, SocketClientService],
})
export class IntegrationModule {}
