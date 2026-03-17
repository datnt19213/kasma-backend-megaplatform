import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  // We use createApplicationContext since we don't need an HTTP server
  // just the background workers/processors
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Register graceful shutdown to clean up BullMQ connections
  app.enableShutdownHooks();

  console.log('Worker is running and listening for jobs...');
}

bootstrap();
