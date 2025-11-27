import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LogDTO } from 'src/activity-log/dto/log.dto';
import { ActivityStatus } from 'src/activity-log/activity-log.enum';

@Injectable()
export class ActivityLogProviderService {
  constructor(
    @InjectQueue('activity-log-queue')
    private readonly queue: Queue<LogDTO>,
  ) {}

  async log(dto: LogDTO) {
    await this.queue.add('log', dto, {
      removeOnComplete: true,
    });
  }

  async logSuccessful(dto: Omit<LogDTO, 'status'>) {
    await this.log({
      ...dto,
      status: ActivityStatus.SUCCESS,
    });
  }

  async logFailed(dto: Omit<LogDTO, 'status'>) {
    await this.log({
      ...dto,
      status: ActivityStatus.FAILED,
    });
  }
}
