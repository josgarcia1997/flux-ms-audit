import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { DatabaseConnection } from '../../../repository/database.connection';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly db: DatabaseConnection) { }

    getHealthStatus(): string {
        return 'Audit Service is up and running';
    }

    async logAction(data: CreateAuditLogDto) {
        this.logger.log(`Audit Action: ${data.action} | Resource: ${data.resource_type} (${data.resource_id})`);
        this.logger.debug('Audit Data:', JSON.stringify(data));

        // Misma tabla que flux-core-backend (migración audit.audit_logs), no public.audit_logs.
        const query = `
            INSERT INTO audit.audit_logs (
                tenant_id,
                actor_user_id,
                action,
                resource_type,
                resource_id,
                metadata_json,
                ip,
                user_agent,
                occurred_at
            ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
        `;  

        const values = [
            data.tenant_id,
            data.actor_user_id ?? null,
            data.action,
            data.resource_type,
            data.resource_id,
            JSON.stringify(data.metadata_json ?? {}),
            data.ip || null,
            data.user_agent || null,
            data.occurred_at,
        ];

        try {
            await this.db.query(query, values);
            this.logger.log('Audit log successfully saved to database');
        } catch (error) {
            this.logger.error('Failed to save audit log to database', error.stack);
            throw error; // Re-lanzamos el error para que el controlador lo maneje (haga nack)
        }
    }
}
