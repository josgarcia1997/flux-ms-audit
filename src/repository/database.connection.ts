import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseConnection implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseConnection.name);
    private pool: Pool;

    constructor(private configService: ConfigService) {
        const dbConfig = this.configService.get('app.database');

        this.pool = new Pool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.name,
            ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async onModuleInit() {
        try {
            const client = await this.pool.connect();
            this.logger.log('Conexión exitosa a PostgreSQL');
            client.release();
        } catch (error) {
            this.logger.error('Error al conectar a PostgreSQL', error.stack);
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('Pool de PostgreSQL cerrado');
    }

    async query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }

    getPool() {
        return this.pool;
    }
}
