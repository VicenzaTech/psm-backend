import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrickTypeDTO } from './dto/create-brick-type.dto';
import { UpdateBrickTypeDTO } from './dto/update-brick-type.dto';
import { REDIS_PROVIDER } from '../common/redis/redis.constant';
import Redis from 'ioredis';
import { Prisma } from '@prisma/client';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { OkResponse } from 'src/common/type/response.type';
import { CacheVersionService } from 'src/common/redis/cache-version.service';

@Injectable()
export class BrickTypeService {
    private readonly logger = new Logger(BrickTypeService.name);
    private readonly allCacheScope = 'brick_types:all';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
        private readonly cacheVersionService: CacheVersionService,
    ) { }

    private getByIdKey(id: number): string {
        return `brick_type:${id}`;
    }

    private async getAllCacheKey(): Promise<string> {
        const version = await this.cacheVersionService.getVersion(this.allCacheScope);
        return `${this.allCacheScope}:v${version}`;
    }

    private async invalidateCache(id?: number): Promise<void> {
        try {
            await this.cacheVersionService.bumpVersion(this.allCacheScope);
            if (id != null) {
                await this.redis.del(this.getByIdKey(id));
            }
        } catch (error) {
            this.logger.error(`Failed to invalidate brick type cache`, (error as any)?.stack);
        }
    }

    async create(dto: CreateBrickTypeDTO) {
        try {
            const foundBrick = await this.prisma.brickType.findFirst({
                where: {
                    code: dto.code,
                },
            });

            if (foundBrick) {
                throw new BadRequestException(`Brick code ${dto.code} already exists`);
            }

            const created = await this.prisma.brickType.create({
                data: dto,
            });

            await this.invalidateCache(created.id);
            return {
                data: created,
                log: {
                    entityType: ActivityEntityType.BrickType,
                    action: "CREATE_BRICK_TYPE",
                    description: `${created.name} đã được tạo mới`,
                    actionType: "CREATE_BRICK_TYPE",
                }
            } as OkResponse
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

        let cacheKey: string | null = null;
        if (noFilter) {
            try {
                cacheKey = await this.getAllCacheKey();
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                this.logger.error(`Failed to read brick types from cache`, (error as any)?.stack);
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

        if (noFilter && cacheKey) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
            } catch (error) {
                this.logger.error(`Failed to write brick types to cache`, (error as any)?.stack);
            }
        }

        return result;
    }

    async findAllActiveBrick(params?: { workshopId?: string; type?: string }) {
        const { workshopId, type } = params || {};
        const noFilter = !workshopId && !type;

        let cacheKey: string | null = null;
        if (noFilter) {
            try {
                cacheKey = await this.getAllCacheKey();
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                this.logger.error(`Failed to read brick types from cache`, (error as any)?.stack);
            }
        }

        const where: Prisma.BrickTypeWhereInput = {
            isActive: true,
        };

        if (workshopId) {
            where.workshopId = workshopId;
        }

        if (type) {
            where.type = type;
        }
        const result = await this.prisma.brickType.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        if (noFilter && cacheKey) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
            } catch (error) {
                this.logger.error(`Failed to write brick types to cache`, (error as any)?.stack);
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
        const found = await this.ensureExists(id);

        const updated = await this.prisma.brickType.update({
            where: { id },
            data: dto,
        });

        await this.invalidateCache(id);

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.BrickType,
                action: "UPDATE_BRICK_TYPE",
                description: `${updated.name} đã được cập nhật`,
                actionType: "UPDATE_BRICK_TYPE",
            }
        } as OkResponse
    }

    async remove(id: number) {
        await this.ensureExists(id);

        const updated = await this.prisma.brickType.update({
            where: { id },
            data: { isActive: false },
        });

        await this.invalidateCache(id);
        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.BrickType,
                action: "DISABLE_BRICK_TYPE",
                description: `${updated.name} đã bị xóa`,
                actionType: "DISABLE_BRICK_TYPE",
            }
        } as OkResponse
    }

    async ensureExists(id: number) {
        const existing = await this.prisma.brickType.findUnique({
            where: { id },
            select: { id: true, isActive: true },
        });

        if (!existing) {
            throw new NotFoundException(`Brick type with id ${id} not found`);
        }
        return existing
    }
}
