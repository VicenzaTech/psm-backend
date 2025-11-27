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
  UseGuards,
} from '@nestjs/common';
import { ProductionLineService } from './production-line.service';
import { CreateProductionLineDTO } from './dto/create-production-line.dto';
import { UpdateProductionLineDTO } from './dto/update-production-line.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';

@Controller('production-line')
export class ProductionLineController {
  constructor(private readonly productionLineService: ProductionLineService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateProductionLineDTO) {
    return this.productionLineService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('workshopId') workshopId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const parsedWorkshopId =
      typeof workshopId === 'string' && workshopId.trim() !== ''
        ? Number(workshopId)
        : undefined;

    const parsedIsActive =
      typeof isActive === 'string'
        ? isActive === 'true'
          ? true
          : isActive === 'false'
            ? false
            : undefined
        : undefined;

    return this.productionLineService.findAll({
      workshopId:
        typeof parsedWorkshopId === 'number' && !Number.isNaN(parsedWorkshopId)
          ? parsedWorkshopId
          : undefined,
      isActive: parsedIsActive,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionLineService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductionLineDTO,
  ) {
    return this.productionLineService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productionLineService.remove(id);
  }
}
