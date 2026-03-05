import { IsString, IsNotEmpty, IsUUID, IsObject, IsIP, IsDateString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    @IsNotEmpty()
    tenant_id: string;

    @IsString()
    @IsNotEmpty()
    actor_user_id: string;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsNotEmpty()
    resource_type: string;

    @IsUUID()
    @IsNotEmpty()
    resource_id: string;

    @IsObject()
    @IsOptional()
    metadata_json: Record<string, any>;

    @IsIP()
    @IsOptional()
    ip: string;

    @IsString()
    @IsOptional()
    user_agent: string;

    @IsDateString()
    @IsNotEmpty()
    occurred_at: string;
}
