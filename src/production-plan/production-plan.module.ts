import { Module } from '@nestjs/common';
import { ProductionPlanController } from './production-plan.controller';
import { ProductionPlanService } from './production-plan.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BrickTypeModule } from 'src/brick-type/brick-type.module';
import { ProductionLineModule } from 'src/production-line/production-line.module';
import { AuthModule } from 'src/auth/auth.module';
import { StageAssignmentModule } from 'src/stage-assignment/stage-assignment.module';

@Module({
  controllers: [ProductionPlanController],
  providers: [ProductionPlanService],
  imports: [
    RedisModule,
    PrismaModule,
    ProductionLineModule,
    BrickTypeModule,
    AuthModule,
    StageAssignmentModule,
  ],
})
export class ProductionPlanModule {}
