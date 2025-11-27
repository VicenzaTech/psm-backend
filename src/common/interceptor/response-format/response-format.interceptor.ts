import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  ActivitySeverity,
  ActivitySource,
} from 'src/activity-log/activity-log.enum';
import { ActivityLogProviderService } from 'src/common/queue/activity-log.queue/activity-log.provider';
import { OkResponse } from 'src/common/type/response.type';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(
    private readonly activityLogProviderService: ActivityLogProviderService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    return next.handle().pipe(
      map((body) => {
        if (
          body instanceof StreamableFile ||
          Buffer.isBuffer(body) ||
          (body && body.status === 'ok') ||
          (body && body.status === 'error')
        ) {
          return body;
        }

        const hasData = body && typeof body === 'object' && 'data' in body;
        const hasMeta = body && typeof body === 'object' && 'meta' in body;
        const hasLog = body && typeof body === 'object' && 'log' in body;
        const payload: OkResponse = {
          status: 'ok',
          data: hasData ? body.data : body,
          ...(hasMeta ? { meta: body.meta } : {}),
        };

        if (hasLog) {
          this.activityLogProviderService
            .logSuccessful({
              userId: user?.id ?? undefined,
              entityId: body?.data?.id,
              entityName: body?.data?.name,
              severity: ActivitySeverity.INFO,
              source: ActivitySource.SYSTEM,
              // ADD TO SERVICE
              description: body?.log?.description,
              metadata: body?.log?.meta,
              action: body?.log?.action,
              entityType: body?.log?.entityType,
              actionType: body?.log?.actionType,
            })
            .catch(() => {
              /* ignore log errors */
            });
        }
        return payload;
      }),
    );
  }
}
