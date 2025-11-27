import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DailyStageProductionService } from './daily-stage-production.service';
import { UpsertDailyStageProduction } from './dto/upsert-daily-stage-production.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';
import { Shift } from '@prisma/client';

@Controller('daily-stage-production')
@UseGuards(AuthGuard)
export class DailyStageProductionController {
  constructor(
    private readonly dailyStageProductionService: DailyStageProductionService,
  ) {}

  @Post()
  async upsert(@Body() dto: UpsertDailyStageProduction, @Req() req: any) {
    const username: string = req.user?.username ?? 'system';
    return this.dailyStageProductionService.upsertDailyStageProduction(
      dto,
      username,
    );
  }

  @Get()
  async findAll(
    @Query('stageAssignmentId') stageAssignmentId?: string,
    @Query('date') date?: string,
    @Query('shift') shift?: Shift,
  ) {
    const assignmentId =
      typeof stageAssignmentId === 'string' && stageAssignmentId.trim() !== ''
        ? Number(stageAssignmentId)
        : undefined;

    const parsedDate =
      typeof date === 'string' && date.trim() !== ''
        ? new Date(date)
        : undefined;

    return this.dailyStageProductionService.findAll({
      stageAssignmentId:
        typeof assignmentId === 'number' && !Number.isNaN(assignmentId)
          ? assignmentId
          : undefined,
      productionDate: parsedDate,
      shift,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dailyStageProductionService.findOne(id);
  }
}
