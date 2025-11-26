import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    BRICK_COUNTER_DEVICE,
    BRICK_COUNTER_MEASUREMENT_TYPE,
    BRICK_COUNTER_POSITION,
    BRICK_COUNTER_PRODUCTION_LINE,
} from 'src/common/BRICK_COUNTER_COMMON';

type HttpMethod = 'GET';

@Injectable()
export class ProductionBackendService {
    private readonly logger = new Logger(ProductionBackendService.name);
    private readonly baseUrl: string;
    private readonly internalKey: string | undefined;

    constructor(private readonly configService: ConfigService) {
        const envBase =
            this.configService.get<string>('PRODUCTION_BACKEND_BASE_URL') ??
            this.configService.get<string>('BASE_API_URL') ??
            'http://localhost:5555';

        this.baseUrl = envBase.replace(/\/+$/, '') + '/api';
        this.internalKey =
            this.configService.get<string>('PRODUCTION_BACKEND_INTERNAL_KEY') ??
            this.configService.get<string>('INTERNAL_SERVER_API_KEY');

        if (!this.internalKey) {
            this.logger.warn(
                'PRODUCTION_BACKEND_INTERNAL_KEY / INTERNAL_SERVER_API_KEY is not set. Requests to production backend may fail.',
            );
        }
    }

    private buildUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${normalizedPath}`;
    }

    // Use global fetch from Node (shim type to avoid TS issues)
    private async request<T>(method: HttpMethod, path: string): Promise<T> {
        const url = this.buildUrl(path);

        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        if (this.internalKey) {
            headers['x-internal-api-key'] = this.internalKey;
        }

        const globalAny: any = global;
        const fetchFn: typeof fetch | undefined = globalAny.fetch;

        if (typeof fetchFn !== 'function') {
            this.logger.error('Global fetch is not available in this runtime');
            throw new Error('Global fetch is not available');
        }

        let response: Response;
        try {
            response = await fetchFn(url, {
                method,
                headers,
            } as any);
            console.log('--response', response)
        } catch (error) {
            this.logger.error(`Request to production backend failed: ${url}`, (error as any)?.stack);
            throw new Error('Failed to connect to production backend');
        }

        if (response.status === 404) {
            return null as T;
        }

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            this.logger.error(
                `Production backend responded with ${response.status} ${response.statusText} for ${url}. Body: ${text}`,
            );
            throw new Error(`Production backend request failed with status ${response.status}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        try {
            const data = (await response.json()) as T;
            return data;
        } catch (error) {
            this.logger.error(
                `Failed to parse JSON response from production backend for ${url}`,
                (error as any)?.stack,
            );
            throw new Error('Invalid JSON response from production backend');
        }
    }

    async getDeviceByDeviceId(deviceId: string): Promise<BRICK_COUNTER_DEVICE | null> {
        if (!deviceId) return null;
        const encoded = encodeURIComponent(deviceId);
        return this.request<BRICK_COUNTER_DEVICE | null>('GET', `/internal-api/devices/by-device-id/${encoded}`);
    }

    async getMeasurementTypeById(id: number): Promise<BRICK_COUNTER_MEASUREMENT_TYPE | null> {
        if (id == null) return null;
        return this.request<BRICK_COUNTER_MEASUREMENT_TYPE | null>('GET', `/internal-api/measurement-types/${id}`);
    }

    async getPositionById(id: number): Promise<(BRICK_COUNTER_POSITION & { productionLineId?: number }) | null> {
        if (id == null) return null;
        return this.request<(BRICK_COUNTER_POSITION & { productionLineId?: number }) | null>(
            'GET',
            `/internal-api/positions/${id}`,
        );
    }

    async getProductionLineById(id: number): Promise<BRICK_COUNTER_PRODUCTION_LINE | null> {
        if (id == null) return null;
        return this.request<BRICK_COUNTER_PRODUCTION_LINE | null>('GET', `/internal-api/production-lines/${id}`);
    }
}

