import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PROVIDER } from './redis.constant';

@Injectable()
export class CacheVersionService {
    private readonly logger = new Logger(CacheVersionService.name);
    private readonly prefix = 'cache_version:';

    constructor(
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
    ) { }

    private buildKey(scope: string): string {
        return `${this.prefix}${scope}`;
    }

    async getVersion(scope: string): Promise<number> {
        const key = this.buildKey(scope);

        try {
            const raw = await this.redis.get(key);
            if (!raw) {
                await this.redis.set(key, '1');
                return 1;
            }

            const parsed = Number(raw);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                await this.redis.set(key, '1');
                return 1;
            }

            return parsed;
        } catch (error) {
            this.logger.error(`Failed to get cache version for scope "${scope}"`, (error as any)?.stack);
            return 1;
        }
    }

    async bumpVersion(scope: string): Promise<number> {
        const key = this.buildKey(scope);

        try {
            const next = await this.redis.incr(key);
            return next;
        } catch (error) {
            this.logger.error(`Failed to bump cache version for scope "${scope}"`, (error as any)?.stack);
            return 0;
        }
    }
}

