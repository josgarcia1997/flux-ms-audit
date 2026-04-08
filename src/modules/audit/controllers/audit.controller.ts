import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AuditService } from '../services/audit.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller()
export class AuditController {
    private readonly logger = new Logger(AuditController.name);

    constructor(private readonly auditService: AuditService) { }

    @MessagePattern('audit_log')
    async handleAuditLog(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            let rawData = data;

            // 1. Si llega como string, lo parseamos a objeto JSON
            if (typeof data === 'string') {
                try {
                    rawData = JSON.parse(data);
                    this.logger.log('JSON string parsed successfully');
                } catch (parseError) {
                    throw new Error('Invalid JSON string format');
                }
            }

            // Envelope típico Nest RMQ: { pattern, data }. Normalizamos a plano del DTO.
            let normalized = rawData;
            if (
                normalized &&
                typeof normalized === 'object' &&
                'data' in normalized &&
                normalized.data &&
                typeof normalized.data === 'object' &&
                'tenant_id' in (normalized.data as object)
            ) {
                normalized = (normalized as { data: unknown }).data;
            }

            // 2. Transformamos el objeto plano a una instancia del DTO
            const auditLogDto = plainToInstance(CreateAuditLogDto, normalized);

            // 3. Validamos manualmente la instancia
            const errors = await validate(auditLogDto);
            if (errors.length > 0) {
                this.logger.warn(
                    `Validación audit_log rechazada: ${JSON.stringify(errors)}`,
                );
                // Confirmamos el mensaje para que no se quede bloqueando la cola, 
                // pero podrías enviarlo a una cola de errores.
                channel.ack(originalMsg);
                return;
            }

            // 4. Pasamos el DTO validado al servicio
            await this.auditService.logAction(auditLogDto);
            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error('Error processing audit log:', error.message);
            // En caso de error de sistema, re-encolamos
            channel.nack(originalMsg, false, true);
        }
    }

    @MessagePattern('audit_health_check')
    getHealth() {
        return this.auditService.getHealthStatus();
    }
}
