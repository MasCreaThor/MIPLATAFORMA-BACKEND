import { Injectable } from '@nestjs/common';
import { AppConfigService } from './modules/config/app.config';
import { DatabaseService } from './modules/database/database.service';

@Injectable()
export class AppService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  async getHealthCheck() {
    const dbConnected = await this.databaseService.checkConnection();
    const dbPing = dbConnected ? await this.databaseService.ping() : false;

    return {
      status: 'available',
      timestamp: new Date().toISOString(),
      environment: this.appConfigService.environment,
      database: {
        connected: dbConnected,
        ping: dbPing,
      },
    };
  }
}