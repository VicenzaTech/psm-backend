import { Job } from 'bullmq';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { LogDTO } from 'src/activity-log/dto/log.dto';
import { WorkerHost, Processor } from '@nestjs/bullmq';

@Processor('activity-log-queue')
export class ActivityLogConsumer extends WorkerHost {
    constructor(private readonly activityLogService: ActivityLogService) {
        super();
    }

    async process(job: Job<LogDTO>): Promise<void> {
        await this.activityLogService.log(job.data);
    }
}
