export type ServiceResponse<T = any, M = any> = {
    data: T,
    meta: M
}

export type OkResponse<T = any, M = any> = {
    status: 'ok';
    data: T;
    meta?: M;
    requestId?: string;
};

export type ErrResponse = {
    status: 'error';
    error: {
        code: string;
        message: string;
        details?: any; // stack/validation errors...
    };
    requestId?: string;
};