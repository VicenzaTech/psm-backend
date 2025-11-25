import { ActivityAction } from "src/activity-log/activity-log.action";
import { ActivityEntityType } from "src/activity-log/activity-log.enum";

export type ServiceResponse<T = any, M = any> = {
    data: T,
    meta: M
}

export type OkResponse<T = any, M = any> = {
    status: 'ok';
    data: T;
    meta?: M;
    requestId?: string;
    log?: LogIntercepterBody
};

export type LogIntercepterBody = {
    description?: string;
    meta?: {
        before: string,
        after: string,
        name: string
    },
    action?: ActivityAction,
    entityType?: ActivityEntityType,
    actionType?: ActivityAction
}

export type ErrResponse = {
    status: 'error';
    error: {
        code: string;
        message: string;
        details?: any; // stack/validation errors...
    };
    requestId?: string;
};