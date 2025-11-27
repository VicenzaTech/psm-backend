import { Module } from '@nestjs/common';
import { DailyStageProductionController } from './daily-stage-production.controller';
import { DailyStageProductionService } from './daily-stage-production.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DailyStageProductionController],
  providers: [DailyStageProductionService],
  imports: [PrismaModule, AuthModule],
})
export class DailyStageProductionModule {}
