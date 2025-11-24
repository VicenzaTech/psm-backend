import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { OkResponse } from 'src/common/type/response.type';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe((
            map((body) => {
                if (
                    body instanceof StreamableFile ||
                    Buffer.isBuffer(body) ||
                    (body && body.status === 'ok') ||
                    (body && body.status === 'error')
                ) {
                    return body
                }

                const payload: OkResponse = {
                    status: 'ok',
                    data: body?.data ?? body,
                    ...(body?.meta ? { meta: body.meta } : {}),
                }
                return payload
            })
        ));
    }
}
