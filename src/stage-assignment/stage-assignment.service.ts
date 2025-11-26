import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stage } from 'src/stage-device-mapping/stage.enum';
import { OkResponse } from 'src/common/type/response.type';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { PlanStatus } from 'src/production-plan/production-plan.enum';
import { StageStatus } from '@prisma/client';

export interface CreateStageAssignmentInput {
    productionPlanId: number;
    stage: Stage;
    targetQuantity?: number;
    notes?: string;
    username: string;
}

export interface UpdateStageAssignmentInput {
    targetQuantity?: number;
    notes?: string;
    isActive?: boolean;
    status?: StageStatus;
}

@Injectable()
export class StageAssignmentService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params?: { productionPlanId?: number; productionLineId?: number; }) {
        const where: any = {};

        if (typeof params?.productionPlanId === 'number') {
            where.productionPlanId = params.productionPlanId;
        }
        if (typeof params?.productionLineId === 'number') {
            where.productionLineId = params.productionLineId;
        }

        return this.prisma.stageAssignment.findMany({
            where,
            orderBy: { id: 'asc' },
        });
    }

    async findOne(id: number) {
        const found = await this.prisma.stageAssignment.findUnique({
            where: { id },
        });

        if (!found) {
            throw new NotFoundException(`Stage assignment with id ${id} not found`);
        }

        return found;
    }

    async create(input: CreateStageAssignmentInput) {
        const { productionPlanId, stage, targetQuantity, notes, username } = input;

        const plan = await this.prisma.productionPlan.findUnique({
            where: { id: productionPlanId },
            select: {
                id: true,
                productionLineId: true,
                brickTypeId: true,
                status: true,
            },
        });

        if (!plan) {
            throw new NotFoundException(`Production plan with id ${productionPlanId} not found`);
        }

        if (plan.status === PlanStatus.CANCELLED || plan.status === PlanStatus.COMPLETED) {
            throw new BadRequestException(
                'Cannot create stage assignment for completed or cancelled plan',
            );
        }

        // Ensure at any time a stage can only have 1 active assignment (global)
        const existingActiveStage = await this.prisma.stageAssignment.findFirst({
            where: {
                stage,
                isActive: true,
            },
            select: { id: true, productionPlanId: true },
        });

        if (existingActiveStage) {
            throw new BadRequestException(
                `Stage "${stage}" is already assigned and active in plan ${existingActiveStage.productionPlanId}. Please disable it before creating a new assignment.`,
            );
        }

        const created = await this.prisma.stageAssignment.create({
            data: {
                productionPlanId,
                productionLineId: plan.productionLineId,
                brickTypeId: plan.brickTypeId,
                stage,
                targetQuantity: targetQuantity ?? null,
                notes,
                createdBy: username,
                status: StageStatus.WAITING,
            },
        });

        return {
            status: 'ok',
            data: created,
            log: {
                entityType: ActivityEntityType.StageAssignment,
                action: 'START_STAGE_ASSIGNMENT',
                actionType: 'START_STAGE_ASSIGNMENT',
                description: `Đã tạo phân công công đoạn ${stage} cho kế hoạch ${productionPlanId}`,
            },
        } as OkResponse;
    }

    async update(id: number, input: UpdateStageAssignmentInput) {
        const existing = await this.findOne(id);

        const data: any = {};

        if (typeof input.targetQuantity === 'number') {
            data.targetQuantity = input.targetQuantity;
        }
        if (typeof input.notes === 'string') {
            data.notes = input.notes;
        }
        if (typeof input.isActive === 'boolean') {
            data.isActive = input.isActive;
        }

        if (input.status) {
            data.status = input.status;

            if (input.status === StageStatus.RUNNING && !existing.startTime) {
                data.startTime = new Date();
            }

            if (
                (input.status === StageStatus.STOPPED ||
                    input.status === StageStatus.ERROR) &&
                !existing.endTime
            ) {
                data.endTime = new Date();
            }
        }

        const updated = await this.prisma.stageAssignment.update({
            where: { id: existing.id },
            data,
        });

        await this.recomputePlanStatusForPlan(updated.productionPlanId);

        return {
            status: 'ok',
            data: updated,
            log: {
                entityType: ActivityEntityType.StageAssignment,
                action: 'UPDATE_STAGE_ASSIGNMENT',
                actionType: 'UPDATE_STAGE_ASSIGNMENT',
                description: `Đã cập nhật phân công công đoạn ${updated.stage} (id: ${updated.id})`,
            },
        } as OkResponse;
    }

    async disable(id: number) {
        const existing = await this.findOne(id);

        if (!existing.isActive) {
            return {
                status: 'ok',
                data: existing,
                log: {
                    entityType: ActivityEntityType.StageAssignment,
                    action: 'STOP_STAGE_ASSIGNMENT',
                    actionType: 'STOP_STAGE_ASSIGNMENT',
                    description: `Phân công công đoạn ${existing.stage} đã ở trạng thái không hoạt động`,
                },
            } as OkResponse;
        }

        const updated = await this.prisma.stageAssignment.update({
            where: { id: existing.id },
            data: { isActive: false, endTime: new Date(), status: StageStatus.STOPPED },
        });

        await this.recomputePlanStatusForPlan(updated.productionPlanId);

        return {
            status: 'ok',
            data: updated,
            log: {
                entityType: ActivityEntityType.StageAssignment,
                action: 'STOP_STAGE_ASSIGNMENT',
                actionType: 'STOP_STAGE_ASSIGNMENT',
                description: `Đã dừng phân công công đoạn ${updated.stage} (id: ${updated.id})`,
            },
        } as OkResponse;
    }

    /**
     * Helper: sau khi trạng thái StageAssignment thay đổi,
     * tự động nâng trạng thái ProductionPlan từ APPROVED -> IN_PROGRESS
     * nếu có bất kỳ assignment RUNNING.
     *
     * Không tự động COMPLETE / CANCEL – việc đó vẫn do ProductionPlanService quyết định.
     */
    private async recomputePlanStatusForPlan(planId: number): Promise<void> {
        const plan = await this.prisma.productionPlan.findUnique({
            where: { id: planId },
            select: {
                id: true,
                status: true,
                stageAssignments: {
                    select: { status: true, isActive: true },
                },
            },
        });

        if (!plan) return;

        if (plan.status === PlanStatus.APPROVED) {
            const hasRunning = plan.stageAssignments.some(
                (a) => a.isActive && a.status === StageStatus.RUNNING,
            );

            if (hasRunning) {
                await this.prisma.productionPlan.update({
                    where: { id: plan.id },
                    data: { status: PlanStatus.IN_PROGRESS },
                });
            }
        }
    }
}

