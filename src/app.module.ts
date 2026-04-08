import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './modules/audit/audit.module';
import { RepositoryModule } from './repository/repository.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    RepositoryModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
})
export class AppModule { }
