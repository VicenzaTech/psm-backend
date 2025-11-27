import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Shift } from '@prisma/client';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { OkResponse } from 'src/common/type/response.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertDailyStageProduction } from './dto/upsert-daily-stage-production.dto';

interface FindAllDailyParams {
  stageAssignmentId?: number;
  productionDate?: Date;
  shift?: Shift;
}

@Injectable()
export class DailyStageProductionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upsert daily production cho 1 stageAssignment trong ngày hiện tại + ca (shift).
   * Dùng cho nhập tay / điều chỉnh thủ công.
   */
  async upsertDailyStageProduction(
    dto: UpsertDailyStageProduction,
    username: string,
  ) {
    const {
      actualQuantity,
      wasteQuantity,
      dataSource,
      shift,
      stageAssignmentId,
      recordedBy,
      notes,
    } = dto;

    const assignment = await this.prisma.stageAssignment.findUnique({
      where: { id: stageAssignmentId },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Stage assignment with id ${stageAssignmentId} not found`,
      );
    }

    if (actualQuantity < 0 || wasteQuantity < 0) {
      throw new BadRequestException(
        'actualQuantity và wasteQuantity phải lớn hơn hoặc bằng 0',
      );
    }

    const now = new Date();
    const productionDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    );

    const existing = await this.prisma.dailyStageProduction.findFirst({
      where: {
        stageAssignmentId,
        productionDate,
        shift: shift ?? null,
      },
    });

    const payload: any = {
      actualQuantity,
      wasteQuantity,
      dataSource,
      recordedBy: recordedBy || username,
      notes,
    };

    let result;
    let isUpdate = false;

    if (existing) {
      result = await this.prisma.dailyStageProduction.update({
        where: { id: existing.id },
        data: payload,
      });
      isUpdate = true;
    } else {
      result = await this.prisma.dailyStageProduction.create({
        data: {
          stageAssignmentId,
          productionDate,
          shift: shift ?? null,
          ...payload,
        },
      });
    }

    const action =
      dataSource === DataSource.auto_sync
        ? 'SYNC_DAILY_PRODUCTION'
        : isUpdate
          ? 'ADJUST_DAILY_PRODUCTION'
          : 'IMPORT_DAILY_PRODUCTION';

    return {
      data: result,
      log: {
        entityType: ActivityEntityType.DailyStageProduction,
        action,
        actionType: action,
        description: isUpdate
          ? `Đã cập nhật sản lượng ngày cho stageAssignment ${stageAssignmentId}`
          : `Đã tạo sản lượng ngày cho stageAssignment ${stageAssignmentId}`,
      },
    } as OkResponse;
  }

  /**
   * startShift: tại thời điểm bắt đầu ca, ghi nhận startCounter.
   */
  async startShift(
    stageAssignmentId: number,
    shift: Shift | null,
    startCounter: number,
    username: string,
  ) {
    const assignment = await this.prisma.stageAssignment.findUnique({
      where: { id: stageAssignmentId },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Stage assignment with id ${stageAssignmentId} not found`,
      );
    }

    const now = new Date();
    const productionDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    const existing = await this.prisma.dailyStageProduction.findFirst({
      where: {
        stageAssignmentId,
        productionDate,
        shift,
      },
    });

    let result;

    if (existing) {
      if (existing.startCounter == null) {
        result = await this.prisma.dailyStageProduction.update({
          where: { id: existing.id },
          data: {
            startCounter,
            dataSource: DataSource.auto_sync,
            recordedBy: username,
          },
        });
      } else {
        result = existing;
      }
    } else {
      result = await this.prisma.dailyStageProduction.create({
        data: {
          stageAssignmentId,
          productionDate,
          shift,
          startCounter,
          actualQuantity: 0,
          wasteQuantity: 0,
          dataSource: DataSource.auto_sync,
          recordedBy: username,
        },
      });
    }

    return {
      data: result,
      log: {
        entityType: ActivityEntityType.DailyStageProduction,
        action: 'SYNC_DAILY_PRODUCTION',
        actionType: 'SYNC_DAILY_PRODUCTION',
        description: `Đã ghi mốc startCounter=${startCounter} cho stageAssignment ${stageAssignmentId}`,
      },
    } as OkResponse;
  }

  /**
   * updateFromTelemetry: nhận counter_total hiện tại, cập nhật actualQuantity.
   * actualQuantity = max(0, endCounter - startCounter).
   */
  async updateFromTelemetry(
    stageAssignmentId: number,
    shift: Shift | null,
    counterTotalNow: number,
  ) {
    const now = new Date();
    const productionDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    const existing = await this.prisma.dailyStageProduction.findFirst({
      where: {
        stageAssignmentId,
        productionDate,
        shift,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `DailyStageProduction for assignment ${stageAssignmentId} on ${productionDate
          .toISOString()
          .slice(
            0,
            10,
          )} with shift ${shift ?? 'null'} not found. startShift phải được gọi trước.`,
      );
    }

    const start = existing.startCounter ?? counterTotalNow;
    const rawQty = counterTotalNow - Number(start);
    const actualQuantity = rawQty >= 0 ? rawQty : 0;

    const result = await this.prisma.dailyStageProduction.update({
      where: { id: existing.id },
      data: {
        endCounter: counterTotalNow,
        actualQuantity,
        dataSource: DataSource.auto_sync,
      },
    });

    return {
      data: result,
      log: {
        entityType: ActivityEntityType.DailyStageProduction,
        action: 'SYNC_DAILY_PRODUCTION',
        actionType: 'SYNC_DAILY_PRODUCTION',
        description: `Đã cập nhật sản lượng ngày cho stageAssignment ${stageAssignmentId} từ counter_total=${counterTotalNow}`,
      },
    } as OkResponse;
  }

  async findOne(id: number) {
    const record = await this.prisma.dailyStageProduction.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `DailyStageProduction with id ${id} not found`,
      );
    }

    return record;
  }

  async findAll(params: FindAllDailyParams) {
    const where: any = {};

    if (typeof params.stageAssignmentId === 'number') {
      where.stageAssignmentId = params.stageAssignmentId;
    }

    if (params.productionDate) {
      const dateOnly = new Date(
        Date.UTC(
          params.productionDate.getFullYear(),
          params.productionDate.getMonth(),
          params.productionDate.getDate(),
        ),
      );
      where.productionDate = dateOnly;
    }

    if (params.shift) {
      where.shift = params.shift;
    }

    return this.prisma.dailyStageProduction.findMany({
      where,
      orderBy: { productionDate: 'desc' },
    });
  }
}
