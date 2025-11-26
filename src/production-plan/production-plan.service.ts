import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheVersionService } from 'src/common/redis/cache-version.service';
import { REDIS_PROVIDER } from 'src/common/redis/redis.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductionPlanDTO } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDTO } from './dto/update-production-plan.dto';
import { BrickTypeService } from 'src/brick-type/brick-type.service';
import { ProductionLineService } from 'src/production-line/production-line.service';
import { PlanStatus } from './production-plan.enum';
import { OkResponse } from 'src/common/type/response.type';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';

@Injectable()
export class ProductionPlanService {
    private readonly allCacheScope = 'production_plans:all';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
        private readonly cacheVersionService: CacheVersionService,
        private readonly brickTypeService: BrickTypeService,
        private readonly productionLineService: ProductionLineService,
    ) { }

    private async invalidateAllCache(): Promise<void> {
        try {
            await this.cacheVersionService.bumpVersion(this.allCacheScope);
        } catch {
            // ignore cache errors
        }
    }

    async findAll(params?: { productionLineId?: number; status?: PlanStatus; customer?: string }) {
        const where: any = {};

        if (typeof params?.productionLineId === 'number') {
            where.productionLineId = params.productionLineId;
        }

        if (params?.status) {
            where.status = params.status;
        }

        if (params?.customer) {
            where.customer = params.customer;
        }

        return this.prisma.productionPlan.findMany({
            where,
            orderBy: { id: 'desc' },
            include: {
                stageAssignments: true
            }
        });
    }

    async findOne(id: number) {
        const plan = await this.prisma.productionPlan.findUnique({
            where: { id },
            include: {
                stageAssignments: true
            }
        });

        if (!plan) {
            throw new NotFoundException(`Production plan with id ${id} not found`);
        }

        return plan;
    }

    async create(dto: CreateProductionPlanDTO & { username: string }) {
        const {
            brickTypeId,
            endDate,
            planCode,
            productionLineId,
            startDate,
            targetQuantity,
            notes,
            username,
            customer,
        } = dto;

        const existingCode = await this.prisma.productionPlan.findUnique({
            where: { planCode },
            select: { id: true },
        });
        if (existingCode) {
            throw new BadRequestException(`Production plan code "${planCode}" already exists`);
        }
        console.log("foundBrickType:", brickTypeId);

        const foundBrickType = await this.brickTypeService.ensureExists(brickTypeId);
        // if (!foundBrickType.isActive) {
        //     throw new BadRequestException(`Brick type with id ${brickTypeId} is inactive`);
        // }

        const foundProductionLine = await this.productionLineService.ensureExists(productionLineId);
        if (!foundProductionLine.isActive) {
            throw new BadRequestException(`Production line with id ${productionLineId} is inactive`);
        }

        if (endDate < startDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        const created = await this.prisma.productionPlan.create({
            data: {
                brickTypeId,
                endDate,
                planCode,
                productionLineId,
                startDate,
                targetQuantity,
                notes,
                createdBy: username,
                customer,
                status: PlanStatus.DRAFT,
            },
        });

        await this.invalidateAllCache();

        return {
            data: created,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'CREATE_PRODUCTION_PLAN',
                actionType: 'CREATE_PRODUCTION_PLAN',
                description: `Đã tạo kế hoạch ${created.planCode}`,
            },
        } as OkResponse;
    }

    async update(id: number, dto: UpdateProductionPlanDTO) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT plans can be updated');
        }

        if (dto.planCode && dto.planCode !== existing.planCode) {
            const duplicated = await this.prisma.productionPlan.findUnique({
                where: { planCode: dto.planCode },
                select: { id: true },
            });

            if (duplicated && duplicated.id !== id) {
                throw new BadRequestException(
                    `Production plan code "${dto.planCode}" already exists`,
                );
            }
        }

        if (dto.brickTypeId) {
            const brick = await this.brickTypeService.ensureExists(dto.brickTypeId);
        }

        if (dto.productionLineId) {
            const line = await this.productionLineService.ensureExists(dto.productionLineId);
            if (!line.isActive) {
                throw new BadRequestException(
                    `Production line with id ${dto.productionLineId} is inactive`,
                );
            }
        }

        if (dto.startDate && dto.endDate && dto.endDate < dto.startDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: dto,
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'UPDATE_PRODUCTION_PLAN',
                actionType: 'UPDATE_PRODUCTION_PLAN',
                description: `Đã cập nhật kế hoạch ${updated.planCode}`,
                meta: {
                    before: JSON.stringify(existing),
                    after: JSON.stringify(updated)
                }
            },
        } as OkResponse;
    }

    async approvel(id: number, username: string) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT plans can be approved');
        }

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: {
                status: PlanStatus.APPROVED,
                approvedBy: username,
                approvedAt: new Date(),
            },

        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'APPROVE_PRODUCTION_PLAN',
                actionType: 'APPROVE_PRODUCTION_PLAN',
                description: `Đã duyệt kế hoạch ${updated.planCode}`,
                meta: {
                    before: existing.status,
                    after: updated.status
                }
            },
        } as OkResponse;
    }

    async reject(id: number, username: string, reason?: string) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.DRAFT && existing.status !== PlanStatus.APPROVED) {
            throw new BadRequestException('Only DRAFT or APPROVED plans can be rejected');
        }

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: {
                status: PlanStatus.CANCELLED,
                notes: reason ?? existing.notes,
            },
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'CANCEL_PRODUCTION_PLAN',
                actionType: 'CANCEL_PRODUCTION_PLAN',
                description: `Đã huỷ kế hoạch ${updated.planCode} bởi ${username}`,
                meta: {
                    before: existing.status,
                    after: updated.status
                }
            },
        } as OkResponse;
    }

    async markInProgress(id: number) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.APPROVED) {
            throw new BadRequestException('Only APPROVED plans can be marked as IN_PROGRESS');
        }

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: {
                status: PlanStatus.IN_PROGRESS,
            },
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'UPDATE_PRODUCTION_PLAN',
                actionType: 'UPDATE_PRODUCTION_PLAN',
                description: `Đã chuyển kế hoạch ${updated.planCode} sang trạng thái IN_PROGRESS`,
                meta: {
                    before: existing.status,
                    after: updated.status
                }
            },
        } as OkResponse;
    }

    async markCompleted(id: number) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.IN_PROGRESS) {
            throw new BadRequestException('Only IN_PROGRESS plans can be marked as COMPLETED');
        }

        const data: any = {
            status: PlanStatus.COMPLETED,
        };

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data,
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'CLOSE_PRODUCTION_PLAN',
                actionType: 'CLOSE_PRODUCTION_PLAN',
                description: `Đã hoàn thành kế hoạch ${updated.planCode}`,
                meta: {
                    before: existing.status,
                    after: updated.status
                }
            },
        } as OkResponse;
    }

    async markCancelled(id: number, reason?: string) {
        const existing = await this.ensureExist(id);

        if (
            existing.status !== PlanStatus.DRAFT &&
            existing.status !== PlanStatus.APPROVED &&
            existing.status !== PlanStatus.IN_PROGRESS
        ) {
            throw new BadRequestException('Only DRAFT/APPROVED/IN_PROGRESS plans can be cancelled');
        }

        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: {
                status: PlanStatus.CANCELLED,
                notes: reason ?? existing.notes,
            },
        });

        await this.invalidateAllCache();

        return {
            data: updated,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'CANCEL_PRODUCTION_PLAN',
                actionType: 'CANCEL_PRODUCTION_PLAN',
                description: `Đã huỷ kế hoạch ${updated.planCode}`,
                meta: {
                    before: existing.status,
                    after: updated.status
                }
            },
        } as OkResponse;
    }

    async remove(id: number) {
        const existing = await this.ensureExist(id);

        if (existing.status !== PlanStatus.DRAFT && existing.status !== PlanStatus.CANCELLED) {
            throw new BadRequestException('Only DRAFT or CANCELLED plans can be deleted');
        }

        const deleted = await this.prisma.productionPlan.delete({
            where: { id },
        });

        await this.invalidateAllCache();

        return {
            data: deleted,
            log: {
                entityType: ActivityEntityType.ProductionPlan,
                action: 'CANCEL_PRODUCTION_PLAN',
                actionType: 'CANCEL_PRODUCTION_PLAN',
                description: `Đã xoá kế hoạch ${deleted.planCode}`,
            },
        } as OkResponse;
    }

    async ensureExistByCode(planCode: string) {
        const existing = await this.prisma.productionPlan.findFirst({
            where: {
                planCode,
            },
            select: {
                id: true,
                planCode: true,
                status: true,
            },
        });

        if (!existing) {
            throw new NotFoundException(`Production plan with code ${planCode} not found`);
        }
        return existing;
    }

    async ensureExist(id: number) {
        const existing = await this.prisma.productionPlan.findUnique({
            where: {
                id,
            },
        });

        if (!existing) {
            throw new NotFoundException(`Production plan with id ${id} not found`);
        }
        return existing;
    }
}
