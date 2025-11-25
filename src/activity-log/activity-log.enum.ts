export enum ActivityEntityType {
    User = 'User',
    BrickType = 'BrickType',
    ProductionPlan = 'ProductionPlan',
    StageAssignment = 'StageAssignment',
    DailyStageProduction = 'DailyStageProduction',
    QualityRecord = 'QualityRecord',
    MeasurementCache = 'MeasurementCache',
    Workshop = 'Workshop',
    ProductionLine = 'ProductionLine',
    Device = 'Device',
    DeviceCluster = 'DeviceCluster',
    Setting = 'Setting',
    Other = 'Other',
    Attachment = 'Attachment',
    ApiToken = 'ApiToken',
    MeasurementType = 'MeasurementType',
    SalaryPeriod = 'SalaryPeriod'
}

export enum ActivityStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export enum ActivitySeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SECURITY = 'SECURITY', // hành động nhạy cảm: phân quyền, đổi mật khẩu, v.v.
}

export enum ActivitySource {
    WEB_ADMIN = 'WEB_ADMIN',
    WEB_APP = 'WEB_APP',
    API = 'API',
    IOT_SYNC = 'IOT_SYNC',
    JOB = 'JOB',      // cron / background job
    SYSTEM = 'SYSTEM',   // hành động hệ thống tự làm
}