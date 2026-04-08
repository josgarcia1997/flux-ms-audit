import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    rabbitmq: {
        uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
        queue: process.env.RABBITMQ_AUDIT_QUEUE || 'audit_queue',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
        user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || process.env.DB_DATABASE || 'flux_audit_db',
        ssl: process.env.DB_SSL === 'true',
    },
}));
