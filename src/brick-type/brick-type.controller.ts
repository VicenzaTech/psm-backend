import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BrickTypeService } from './brick-type.service';
import { CreateBrickTypeDTO } from './dto/create-brick-type.dto';
import { UpdateBrickTypeDTO } from './dto/update-brick-type.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';
import { ActivityLogProviderService } from 'src/common/queue/activity-log.queue/activity-log.provider';
import { ActivityAction } from 'src/activity-log/activity-log.action';
import { ActivityEntityType, ActivitySeverity, ActivitySource } from 'src/activity-log/activity-log.enum';

@Controller('brick-type')
export class BrickTypeController {
    constructor(
        private readonly brickTypeService: BrickTypeService,
        private readonly activityLogProviderService: ActivityLogProviderService,
    ) { }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() dto: CreateBrickTypeDTO, @Req() req, @Res({passthrough: true}) res) {
        const created = await this.brickTypeService.create(dto);
        return created
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll(
        @Query('workshopId') workshopId?: string,
        @Query('type') type?: string,
    ) {
        return this.brickTypeService.findAll({
            workshopId,
            type,
        });
    }

    @Get('all')
    findAllActiveBrick(
        @Query('workshopId') workshopId?: string,
        @Query('type') type?: string,
    ) {
        return this.brickTypeService.findAllActiveBrick({
            workshopId,
            type,
        });
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brickTypeService.findOne(id);
    }


    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrickTypeDTO, @Req() req, @Res({passthrough: true}) res) {
        const updated = await this.brickTypeService.update(id, dto);
        return updated
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req, @Res({passthrough: true}) res) {
        const removed = await this.brickTypeService.remove(id);
        return removed
    }
}
