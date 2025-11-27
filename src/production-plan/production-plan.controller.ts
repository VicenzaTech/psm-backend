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
import { ProductionPlanService } from './production-plan.service';
import { CreateProductionPlanDTO } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDTO } from './dto/update-production-plan.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';
import { PlanStatus } from './production-plan.enum';

@Controller('production-plan')
@UseGuards(AuthGuard)
export class ProductionPlanController {
  constructor(private readonly productionPlanService: ProductionPlanService) {}

  @Post()
  async create(@Body() dto: CreateProductionPlanDTO, @Req() req: any) {
    const username: string = req.user?.username ?? 'system';
    return this.productionPlanService.create({ ...dto, username });
  }

  @Get()
  async findAll(
    @Query('productionLineId') productionLineId?: string,
    @Query('status') status?: PlanStatus,
    @Query('customer') customer?: string,
  ) {
    const lineId =
      typeof productionLineId === 'string' && productionLineId.trim() !== ''
        ? Number(productionLineId)
        : undefined;

    return this.productionPlanService.findAll({
      productionLineId:
        typeof lineId === 'number' && !Number.isNaN(lineId)
          ? lineId
          : undefined,
      status,
      customer:
        customer && customer.trim() !== '' ? customer.trim() : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionPlanService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductionPlanDTO,
  ) {
    return this.productionPlanService.update(id, dto);
  }

  @Post(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const username: string = req.user?.username ?? 'system';
    return this.productionPlanService.approvel(id, username);
  }

  @Post(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const username: string = req.user?.username ?? 'system';
    return this.productionPlanService.reject(id, username, body?.reason);
  }

  @Post(':id/in-progress')
  async markInProgress(@Param('id', ParseIntPipe) id: number) {
    return this.productionPlanService.markInProgress(id);
  }

  @Post(':id/complete')
  async markCompleted(@Param('id', ParseIntPipe) id: number) {
    return this.productionPlanService.markCompleted(id);
  }

  @Post(':id/cancel')
  async markCancelled(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.productionPlanService.markCancelled(id, body?.reason);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productionPlanService.remove(id);
  }
}
