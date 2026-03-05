export interface AuditLog {
    tenant_id: string;
    actor_user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    metadata_json: Record<string, any>;
    ip: string;
    user_agent: string;
    occurred_at: Date;
}
