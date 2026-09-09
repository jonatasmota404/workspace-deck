import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemGateway } from './system.gateway';
import { ConfigService } from './config.service';

@Module({
  providers: [SystemService, SystemGateway, ConfigService],
  controllers: [SystemController]
})
export class SystemModule {}
