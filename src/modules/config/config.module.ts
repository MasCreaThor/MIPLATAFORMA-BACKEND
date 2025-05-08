import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { jwtConfig } from './jwt.config';
import { appConfig, AppConfigService } from './app.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, appConfig],
      envFilePath: '.env',
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class ConfigModule {}