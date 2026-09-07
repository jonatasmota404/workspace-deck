import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemGateway } from './system.gateway';

@Module({
  providers: [SystemService, SystemGateway],
  controllers: [SystemController]
})
export class SystemModule {}
