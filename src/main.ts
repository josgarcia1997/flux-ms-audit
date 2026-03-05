import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for all incoming messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


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

