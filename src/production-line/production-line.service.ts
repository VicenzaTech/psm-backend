import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionLineDTO } from './dto/create-production-line.dto';
import { UpdateProductionLineDTO } from './dto/update-production-line.dto';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { OkResponse } from 'src/common/type/response.type';
import { REDIS_PROVIDER } from 'src/common/redis/redis.constant';
import Redis from 'ioredis';
import { CacheVersionService } from 'src/common/redis/cache-version.service';

@Injectable()
export class ProductionLineService {
    private readonly logger = new Logger(ProductionLineService.name);
    private readonly allCacheScope = 'production_lines:all';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
        private readonly cacheVersionService: CacheVersionService,
    ) { }

    private async getAllCacheKey(): Promise<string> {
        const version = await this.cacheVersionService.getVersion(this.allCacheScope);
        return `${this.allCacheScope}:v${version}`;
    }

    private async invalidateAllCache(): Promise<void> {
        try {
            await this.cacheVersionService.bumpVersion(this.allCacheScope);
        } catch (error) {
            this.logger.error('Failed to bump production line cache version', (error as any)?.stack);
        }
    }

    async create(dto: CreateProductionLineDTO) {
        const workshop = await this.prisma.workshop.findUnique({
            where: { id: dto.workshopId },
            select: { id: true, isActive: true },
        });

        if (!workshop) {
            throw new NotFoundException(`Workshop with id ${dto.workshopId} not found`);
        }

        if (!workshop.isActive) {
            throw new BadRequestException('Cannot create production line in a disabled workshop');
        }

        const existingLine = await this.prisma.productionLine.findFirst({
            where: {
                workshopId: dto.workshopId,
                code: dto.code,
            },
            select: { id: true },
        });

        if (existingLine) {
            throw new BadRequestException(`Production line code ${dto.code} already exists in this workshop`);
        }

        const created = await this.prisma.productionLine.create({
            data: dto,
        });

        await this.invalidateAllCache();

        return {
            data: created,
            log: {
                entityType: ActivityEntityType.ProductionLine,
                action: 'CREATE_PRODUCTION_LINE',
                actionType: 'CREATE_PRODUCTION_LINE',
                description: `${created.name} đã được tạo mới`,
            },
        } as OkResponse;
    }

    async findAll(params?: { workshopId?: number; isActive?: boolean }) {
        const { workshopId, isActive } = params || {};

        const hasExplicitIsActive = params && typeof params.isActive !== 'undefined';
        const effectiveIsActive = hasExplicitIsActive ? isActive : true;

        const shouldUseCache =
            (!hasExplicitIsActive || effectiveIsActive === true) && typeof workshopId === 'undefined';

        let cacheKey: string | null = null;
        if (shouldUseCache) {
            try {
                cacheKey = await this.getAllCacheKey();
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                this.logger.error('Failed to read production lines from cache', (error as any)?.stack);
            }
        }

        const where: any = {};

        if (typeof workshopId === 'number') {
            where.workshopId = workshopId;
        }

        if (typeof effectiveIsActive === 'boolean') {
            where.isActive = effectiveIsActive;
        }

        const result = await this.prisma.productionLine.findMany({
            where,
            orderBy: { id: 'asc' },
        });

        if (shouldUseCache && cacheKey) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
            } catch (error) {
                this.logger.error('Failed to write production lines to cache', (error as any)?.stack);
            }
        }

        return result;
    }

    async findOne(id: number) {
        const line = await this.prisma.productionLine.findUnique({
            where: { id },
        });

        if (!line) {
            throw new NotFoundException(`Production line with id ${id} not found`);
        }

        return line;
    }

    async update(id: number, dto: UpdateProductionLineDTO) {
        const existing = await this.prisma.productionLine.findUnique({
            where: { id },
            select: {
                id: true,
                workshopId: true,
                code: true,
            },
        });

        if (!existing) {
            throw new NotFoundException(`Production line with id ${id} not found`);
        }

        const targetWorkshopId = dto.workshopId ?? existing.workshopId;

        const workshop = await this.prisma.workshop.findUnique({
            where: { id: targetWorkshopId },
            select: { id: true, isActive: true },
        });

        if (!workshop) {
            throw new NotFoundException(`Workshop with id ${targetWorkshopId} not found`);
        }

        if (!workshop.isActive) {
            throw new BadRequestException('Cannot update production line to a disabled workshop');
        }

        if (dto.code || dto.workshopId) {
            const codeToCheck = dto.code ?? existing.code;

            const duplicated = await this.prisma.productionLine.findFirst({
                where: {
                    workshopId: targetWorkshopId,
                    code: codeToCheck,
                    id: { not: id },
                },
                select: { id: true },
            });

            if (duplicated) {
                throw new BadRequestException(`Production line code ${codeToCheck} already exists in this workshop`);
            }
        }

        const updated = await this.prisma.productionLine.update({
            where: { id },
            data: dto,
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionLine,
                action: 'UPDATE_PRODUCTION_LINE',
                actionType: 'UPDATE_PRODUCTION_LINE',
                description: `${updated.name} đã được cập nhật`,
            },
        } as OkResponse;
    }

    async remove(id: number) {
        await this.ensureExists(id);

        const updated = await this.prisma.productionLine.update({
            where: { id },
            data: { isActive: false },
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionLine,
                action: 'DISABLE_PRODUCTION_LINE',
                actionType: 'DISABLE_PRODUCTION_LINE',
                description: `${updated.name} đã được vô hiệu hóa`,
            },
        } as OkResponse;
    }

    async ensureExists(id: number){
        const existing = await this.prisma.productionLine.findUnique({
            where: { id },
            select: { id: true, isActive: true},
        });

        if (!existing) {
            throw new NotFoundException(`Production line with id ${id} not found`);
        }

        return existing
    }
}
