import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrickTypeDTO } from './dto/create-brick-type.dto';
import { UpdateBrickTypeDTO } from './dto/update-brick-type.dto';
import { REDIS_PROVIDER } from '../common/redis/redis.constant';
import Redis from 'ioredis';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrickTypeService {
    private readonly logger = new Logger(BrickTypeService.name);
    private readonly allCacheKey = 'brick_types:all';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
    ) {}

    private getByIdKey(id: number): string {
        return `brick_type:${id}`;
    }

    private async invalidateCache(id?: number): Promise<void> {
        try {
            await this.redis.del(this.allCacheKey);
            if (id != null) {
                await this.redis.del(this.getByIdKey(id));
            }
        } catch (error) {
            this.logger.error(`Failed to invalidate brick type cache`, error.stack);
        }
    }

    async create(dto: CreateBrickTypeDTO) {
        try {
            const created = await this.prisma.brickType.create({
                data: dto,
            });

            await this.invalidateCache(created.id);

            return created;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                this.logger.warn(`Duplicate brick type code: ${dto.code}`);
            }
            this.logger.error(`Failed to create brick type`, error.stack);
            throw error;
        }
    }

    async findAll(params?: { workshopId?: string; type?: string; isActive?: boolean }) {
        const { workshopId, type, isActive = true } = params || {};

        const noFilter = !workshopId && !type && isActive === true;

        if (noFilter) {
            try {
                const cached = await this.redis.get(this.allCacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                this.logger.error(`Failed to read brick types from cache`, error.stack);
            }
        }

        const where: any = {};

        if (workshopId) {
            where.workshopId = workshopId;
        }

        if (type) {
            where.type = type;
        }

        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }

        const result = await this.prisma.brickType.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        if (noFilter) {
            try {
                await this.redis.set(this.allCacheKey, JSON.stringify(result), 'EX', 60);
            } catch (error) {
                this.logger.error(`Failed to write brick types to cache`, error.stack);
            }
        }

        return result;
    }

    async findOne(id: number) {
        const cacheKey = this.getByIdKey(id);

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            this.logger.error(`Failed to read brick type ${id} from cache`, error.stack);
        }

        const brickType = await this.prisma.brickType.findUnique({
            where: { id },
        });

        if (!brickType) {
            throw new NotFoundException(`Brick type with id ${id} not found`);
        }

        try {
            await this.redis.set(cacheKey, JSON.stringify(brickType), 'EX', 60);
        } catch (error) {
            this.logger.error(`Failed to write brick type ${id} to cache`, error.stack);
        }

        return brickType;
    }

    async update(id: number, dto: UpdateBrickTypeDTO) {
        await this.ensureExists(id);

        const updated = await this.prisma.brickType.update({
            where: { id },
            data: dto,
        });

        await this.invalidateCache(id);

        return updated;
    }

    async remove(id: number) {
        await this.ensureExists(id);

        const updated = await this.prisma.brickType.update({
            where: { id },
            data: { isActive: false },
        });

        await this.invalidateCache(id);

        return updated;
    }

    private async ensureExists(id: number): Promise<void> {
        const existing = await this.prisma.brickType.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            throw new NotFoundException(`Brick type with id ${id} not found`);
        }
    }
}
