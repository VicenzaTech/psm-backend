import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ActivityLogProviderService } from './activity-log.provider';
import { ActivityLogConsumer } from './activity-log.consumer';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'activity-log-queue',
    }),
  ],
  providers: [ActivityLogProviderService, ActivityLogConsumer],
  exports: [ActivityLogProviderService],
})
export class ActivityLogQueueModule {}
