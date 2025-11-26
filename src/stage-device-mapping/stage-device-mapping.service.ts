import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStageDeviceMapping } from './dto/create-stage-device-mapping.dto';
import { UpdateStageDeviceMapping } from './dto/update-stage-device-mapping.dto';
import { ProductionBackendService } from 'src/production-backend/production-backend.service';
import { OkResponse } from 'src/common/type/response.type';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { StageStatus } from '@prisma/client';
import { UpdateStageDevieMappingStatus } from './dto/update-stage-device-mapping-status.dto';

@Injectable()
export class StageDeviceMappingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly productionBackend: ProductionBackendService,
    ) { }

    async findAllDeviceMapping() {
        return this.prisma.stageDeviceMapping.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async findAllActiveDeviceMapping() {
        return this.prisma.stageDeviceMapping.findMany({
            orderBy: { id: 'asc' },
            where: {
                isActive: true,
            },
        });
    }

    async getDeviceMappingById(id: number) {
        return this.ensureDeviceMappingExist(id);
    }

    async getMappingsByProductionLine(productionLineId: number) {
        return this.prisma.stageDeviceMapping.findMany({
            where: { productionLineId },
            orderBy: { id: 'asc' },
        });
    }

    async createDeviceMapping(dto: CreateStageDeviceMapping) {
        const {
            iotDeviceId,
            iotMeasurementTypeId,
            measurementPosition,
            productionLineId,
            stage,
            isActive,
        } = dto;

        const productionLine = await this.prisma.productionLine.findUnique({
            where: { id: productionLineId },
            select: { id: true, isActive: true },
        });

        if (!productionLine) {
            throw new NotFoundException(`Production line with id ${productionLineId} not found`);
        }

        if (!productionLine.isActive) {
            throw new BadRequestException('Cannot map device to an inactive production line');
        }

        // Only 1 active mapping per device
        const existingDeviceMapping = await this.prisma.stageDeviceMapping.findFirst({
            where: {
                iotDeviceId,
                isActive: true,
            },
        });

        if (existingDeviceMapping) {
            throw new BadRequestException(
                `Device with iotDeviceId "${iotDeviceId}" already has an active mapping`,
            );
        }

        // Only 1 active mapping per production line + stage
        const existingStageMapping = await this.prisma.stageDeviceMapping.findFirst({
            where: {
                productionLineId,
                stage,
                isActive: true,
            },
        });

        if (existingStageMapping) {
            throw new BadRequestException(
                `Production line ${productionLineId} at stage "${stage}" already has an active mapping`,
            );
        }

        const [device, measurementType, position] = await Promise.all([
            this.productionBackend.getDeviceByDeviceId(iotDeviceId),
            this.productionBackend.getMeasurementTypeById(Number(iotMeasurementTypeId)),
            this.productionBackend.getPositionById(measurementPosition),
        ]);

        if (!device) {
            throw new BadRequestException('iotDeviceId does not exist on production backend');
        }

        if (!measurementType) {
            throw new BadRequestException('iotMeasurementTypeId does not exist on production backend');
        }

        if (!position) {
            throw new BadRequestException('measurementPosition does not exist on production backend');
        }

        if (
            typeof position.productionLineId === 'number' &&
            position.productionLineId !== productionLineId
        ) {
            throw new BadRequestException(
                'measurementPosition does not belong to the given production line',
            );
        }

        const created = await this.prisma.stageDeviceMapping.create({
            data: {
                productionLineId,
                stage,
                measurementPosition,
                iotDeviceId,
                iotMeasurementTypeId: Number(iotMeasurementTypeId),
                isActive: typeof isActive === 'boolean' ? isActive : true,
            },
        });

        return {
            status: 'ok',
            data: created,
            log: {
                action: 'CREATE_DEVICE',
                actionType: 'CREATE_DEVICE',
                description: `Đã mapping thiết bị ${created.iotDeviceId}`,
                entityType: ActivityEntityType.Device,
            },
        } as OkResponse;
    }

    async updateDeviceMapping(stageMappingId: number, dto: UpdateStageDeviceMapping) {
        const {
            iotDeviceId,
            iotMeasurementTypeId,
            measurementPosition,
            productionLineId,
            stage,
            isActive,
        } = dto;

        const existing = await this.ensureDeviceMappingExist(stageMappingId);

        const targetProductionLineId =
            typeof productionLineId === 'number' ? productionLineId : existing.productionLineId;
        const targetStage = stage ?? existing.stage;
        const targetIotDeviceId =
            typeof iotDeviceId === 'string' ? iotDeviceId : existing.iotDeviceId;
        const targetIsActive =
            typeof isActive === 'boolean' ? isActive : existing.isActive ?? true;

        const productionLine = await this.prisma.productionLine.findUnique({
            where: { id: targetProductionLineId },
            select: { id: true, isActive: true },
        });

        if (!productionLine) {
            throw new NotFoundException(`Production line with id ${targetProductionLineId} not found`);
        }

        if (!productionLine.isActive) {
            throw new BadRequestException('Cannot update mapping on an inactive production line');
        }

        // If mapping will be active, enforce uniqueness
        if (targetIsActive) {
            if (targetIotDeviceId) {
                const duplicatedDevice = await this.prisma.stageDeviceMapping.findFirst({
                    where: {
                        iotDeviceId: targetIotDeviceId,
                        isActive: true,
                        id: { not: existing.id },
                    },
                });

                if (duplicatedDevice) {
                    throw new BadRequestException(
                        `Device with iotDeviceId "${targetIotDeviceId}" already has an active mapping`,
                    );
                }
            }

            const duplicatedStage = await this.prisma.stageDeviceMapping.findFirst({
                where: {
                    productionLineId: targetProductionLineId,
                    stage: targetStage,
                    isActive: true,
                    id: { not: existing.id },
                },
            });

            if (duplicatedStage) {
                throw new BadRequestException(
                    `Production line ${targetProductionLineId} at stage "${targetStage}" already has an active mapping`,
                );
            }
        }

        if (iotDeviceId) {
            const device = await this.productionBackend.getDeviceByDeviceId(iotDeviceId);
            if (!device) {
                throw new BadRequestException('iotDeviceId does not exist on production backend');
            }
        }

        if (typeof iotMeasurementTypeId !== 'undefined') {
            const measurementType = await this.productionBackend.getMeasurementTypeById(
                Number(iotMeasurementTypeId),
            );
            if (!measurementType) {
                throw new BadRequestException('iotMeasurementTypeId does not exist on production backend');
            }
        }

        if (typeof measurementPosition === 'number') {
            const position = await this.productionBackend.getPositionById(measurementPosition);
            if (!position) {
                throw new BadRequestException('measurementPosition does not exist on production backend');
            }
            if (
                typeof position.productionLineId === 'number' &&
                position.productionLineId !== targetProductionLineId
            ) {
                throw new BadRequestException(
                    'measurementPosition does not belong to the given production line',
                );
            }
        }

        const updated = await this.prisma.stageDeviceMapping.update({
            where: { id: existing.id },
            data: {
                ...(typeof targetProductionLineId === 'number'
                    ? { productionLineId: targetProductionLineId }
                    : {}),
                ...(targetStage ? { stage: targetStage } : {}),
                ...(typeof measurementPosition === 'number' ? { measurementPosition } : {}),
                ...(typeof iotDeviceId === 'string' ? { iotDeviceId } : {}),
                ...(typeof iotMeasurementTypeId !== 'undefined'
                    ? { iotMeasurementTypeId: Number(iotMeasurementTypeId) }
                    : {}),
                ...(typeof isActive === 'boolean' ? { isActive } : {}),
            },
        });

        return {
            status: 'ok',
            data: updated,
            log: {
                action: 'UPDATE_DEVICE',
                actionType: 'UPDATE_DEVICE',
                description: `Đã cập nhật mapping thiết bị ${updated.iotDeviceId}`,
                entityType: ActivityEntityType.Device,
            },
        } as OkResponse;
    }

    async removeDeviceMapping(stageMappingId: number) {
        const existing = await this.ensureDeviceMappingExist(stageMappingId);

        const updated = await this.prisma.stageDeviceMapping.update({
            where: {
                id: existing.id,
            },
            data: {
                isActive: false,
            },
        });

        return {
            status: 'ok',
            data: updated,
            log: {
                action: 'DISABLE_DEVICE',
                actionType: 'DISABLE_DEVICE',
                description: `Đã vô hiệu hóa mapping thiết bị ${updated.iotDeviceId} khỏi dây chuyền`,
                entityType: ActivityEntityType.Device,
            },
        } as OkResponse;
    }

    async updateStageStatus(id: number, dto: UpdateStageDevieMappingStatus) {
        const { stageStatus } = dto
        await this.ensureDeviceMappingExist(id)

        const updated = await this.prisma.stageDeviceMapping.update({
            where: {
                id
            },
            data: {
                stageLiveStatus: stageStatus
            }
        })

        return {
            data: updated,
            log: {
                action: 'UPDATE_DEVICE',
                actionType: 'UPDATE_DEVICE',
                description: `Đã đánh dấu thiết bị ${updated.iotDeviceId} có trạng thái: ${stageStatus}`,
                entityType: ActivityEntityType.Device,
            }
        } as OkResponse
    }

    async activateDeviceMapping(stageMappingId: number) {
        const existing = await this.ensureDeviceMappingExist(stageMappingId);

        const updated = await this.prisma.stageDeviceMapping.update({
            where: {
                id: existing.id,
            },
            data: {
                isActive: true,
            },
        });

        return {
            status: 'ok',
            data: updated,
            log: {
                action: 'DEVICE_RECOVERED',
                actionType: 'DEVICE_RECOVERED',
                description: `Đã bật lại mapping thiết bị ${updated.iotDeviceId} trong dây chuyền`,
                entityType: ActivityEntityType.Device,
            },
        } as OkResponse;
    }

    async ensureDeviceMappingExist(stageDeviceMappingId: number) {
        const foundStageDeviceMapping = await this.prisma.stageDeviceMapping.findUnique({
            where: {
                id: stageDeviceMappingId,
            },
        });

        if (!foundStageDeviceMapping) {
            throw new NotFoundException(
                `Mapping thiết bị với id ${stageDeviceMappingId} chưa được cấu hình`,
            );
        }

        return foundStageDeviceMapping;
    }
}
