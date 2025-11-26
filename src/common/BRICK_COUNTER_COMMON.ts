export class BRICK_COUNTER_PRODUCTION_LINE {
    id: number;
    name: string;
    description?: string;
    status: string;
    positions: BRICK_COUNTER_POSITION[];
}

export class BRICK_COUNTER_POSITION {
    id: number;
    name: string;
    description?: string;
    coordinates?: string;
    index: number;
    productionLine: BRICK_COUNTER_PRODUCTION_LINE;
    devices: BRICK_COUNTER_DEVICE[];
}

export class BRICK_COUNTER_DEVICE {
    id: number;
    deviceId: string;
    name: string;
    type?: string;
    serial_number: string;
    installation_date?: string;
    status: string;
    last_maintenance?: string;
    extraInfo: Record<string, any>;
    position: BRICK_COUNTER_POSITION | null;
    clusterId: number | null;
}

export class BRICK_COUNTER_MEASUREMENT {
    id: string;
    timestamp: Date;
    device_id: number;
    cluster_id: number | null;
    type_id: number;
    ingest_time: Date;
    data: Record<string, any>;
    device: BRICK_COUNTER_DEVICE;
    type: BRICK_COUNTER_MEASUREMENT_TYPE;
}

export class BRICK_COUNTER_MEASUREMENT_TYPE {
    id: number;
    code: string; // VD: COUNT_BRICK, TEMP_C, HUMIDITY
    name: string; // Tên dễ đọc: "Đếm gạch", "Nhiệt độ (°C)", ...
    data_schema: Record<string, any>; // VD: { count: 'number' } | { humidity: 'number' }
    data_schema_version: number;
    description?: string;
    clusters: Record<string, any>[];
    measurements: BRICK_COUNTER_MEASUREMENT[];
}