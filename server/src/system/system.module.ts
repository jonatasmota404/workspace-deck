import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemGateway } from './system.gateway';
import { ConfigService } from './config.service';
import { AppsDiscoveryService } from './apps-discovery.service';

@Module({
  providers: [SystemService, SystemGateway, ConfigService, AppsDiscoveryService],
  controllers: [SystemController],
  exports: [AppsDiscoveryService]
})
export class SystemModule {}
