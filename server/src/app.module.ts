import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemModule } from './system/system.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [SystemModule],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
