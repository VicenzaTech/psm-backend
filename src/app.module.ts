import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrickTypeModule } from './brick-type/brick-type.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { BullModule } from '@nestjs/bullmq';
import { ActivityLogQueueModule } from './common/queue/activity-log.queue/activity-log.queue';
import { WorkshopModule } from './workshop/workshop.module';
import { ProductionLineModule } from './production-line/production-line.module';
import { StageDeviceMappingModule } from './stage-device-mapping/stage-device-mapping.module';
import { ProductionPlanModule } from './production-plan/production-plan.module';
import { StageAssignmentModule } from './stage-assignment/stage-assignment.module';
import { QualityRecordModule } from './quality-record/quality-record.module';
import { DailyStageProductionModule } from './daily-stage-production/daily-stage-production.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BrickTypeModule,
    PrismaModule,
    AuthModule,
    ActivityLogModule,
    ActivityLogQueueModule,
    WorkshopModule,
    ProductionLineModule,
    StageDeviceMappingModule,
    ProductionPlanModule,
    StageAssignmentModule,
    QualityRecordModule,
    DailyStageProductionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
