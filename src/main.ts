import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // No ValidationPipe global: con forbidNonWhitelisted puede romper mensajes RMQ antes del handler.
  // Los eventos audit_log se validan en AuditController con class-validator.

  const rabbitUri = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
  const rabbitQueue = process.env.RABBITMQ_AUDIT_QUEUE || 'audit_queue';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUri],
      queue: rabbitQueue,
      queueOptions: {
        durable: false,
      },
      noAck: false, // Explicit acknowledgement
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Flux-ms-audit is listening on port ${process.env.PORT ?? 3000}`);
}
bootstrap();

