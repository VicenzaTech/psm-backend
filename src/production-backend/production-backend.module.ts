import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductionBackendService } from './production-backend.service';
import { ProductionBackendController } from './production-backend.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ProductionBackendController],
  providers: [ProductionBackendService],
  exports: [ProductionBackendService],
})
export class ProductionBackendModule {}
