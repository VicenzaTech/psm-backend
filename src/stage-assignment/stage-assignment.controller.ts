import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StageAssignmentService } from './stage-assignment.service';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';
import { Stage } from 'src/stage-device-mapping/stage.enum';
import { StageStatus } from '@prisma/client';

@Controller('stage-assignment')
@UseGuards(AuthGuard)
export class StageAssignmentController {
  constructor(
    private readonly stageAssignmentService: StageAssignmentService,
  ) {}
  @Get()
  async findAll(
    @Query('productionPlanId') productionPlanId?: string,
    @Query('productionLineId') productionLineId?: string,
  ) {
    const planId =
      typeof productionPlanId === 'string' && productionPlanId.trim() !== ''
        ? Number(productionPlanId)
        : undefined;
    const lineId =
      typeof productionLineId === 'string' && productionLineId.trim() !== ''
        ? Number(productionLineId)
        : undefined;

    return await this.stageAssignmentService.findAll({
      productionPlanId:
        typeof planId === 'number' && !Number.isNaN(planId)
          ? planId
          : undefined,
      productionLineId:
        typeof lineId === 'number' && !Number.isNaN(lineId)
          ? lineId
          : undefined,
    });
  }

  @Get('active')
  async findActive(
    @Query('productionPlanId') productionPlanId?: string,
    @Query('productionLineId') productionLineId?: string,
  ) {
    const planId =
      typeof productionPlanId === 'string' && productionPlanId.trim() !== ''
        ? Number(productionPlanId)
        : undefined;
    const lineId =
      typeof productionLineId === 'string' && productionLineId.trim() !== ''
        ? Number(productionLineId)
        : undefined;
    return await this.stageAssignmentService.findActive({
      productionLineId: lineId,
      productionPlanId: planId,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.findOne(id);
  }

  @Post()
  async create(
    @Req() req,
    @Body()
    body: {
      productionPlanId: number;
      stage: Stage;
      targetQuantity?: number;
      notes?: string;
    },
  ) {
    const username = req?.user?.username ?? 'system';

    return await this.stageAssignmentService.create({
      productionPlanId: body.productionPlanId,
      stage: body.stage,
      targetQuantity: body.targetQuantity,
      notes: body.notes,
      username,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      targetQuantity?: number;
      notes?: string;
      isActive?: boolean;
    },
  ) {
    return await this.stageAssignmentService.update(id, body);
  }

  @Delete(':id')
  async disable(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.disable(id);
  }

  /**
   * Các API chuyên đổi trạng thái stage (để UI/worker gọi rõ nghĩa hơn)
   */
  @Post(':id/start')
  async start(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.updateStageStatus(
      id,
      StageStatus.RUNNING,
    );
  }

  @Post(':id/wait')
  async wait(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.updateStageStatus(
      id,
      StageStatus.WAITING,
    );
  }

  @Post(':id/error')
  async error(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.updateStageStatus(
      id,
      StageStatus.ERROR,
    );
  }

  @Post(':id/stop')
  async stop(@Param('id', ParseIntPipe) id: number) {
    return await this.stageAssignmentService.updateStageStatus(
      id,
      StageStatus.STOPPED,
    );
  }
}
