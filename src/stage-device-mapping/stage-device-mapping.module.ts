import { Module } from '@nestjs/common';
import { StageDeviceMappingController } from './stage-device-mapping.controller';
import { StageDeviceMappingService } from './stage-device-mapping.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductionBackendModule } from 'src/production-backend/production-backend.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StageDeviceMappingController],
  providers: [StageDeviceMappingService],
  imports: [PrismaModule, ProductionBackendModule, AuthModule],
})
export class StageDeviceMappingModule {}
