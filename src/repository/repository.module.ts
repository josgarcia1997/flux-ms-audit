import { Module, Global } from '@nestjs/common';
import { DatabaseConnection } from './database.connection';

@Global()
@Module({
    providers: [DatabaseConnection],
    exports: [DatabaseConnection],
})
export class RepositoryModule { }
