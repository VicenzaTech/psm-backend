import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BrickTypeService } from './brick-type.service';
import { CreateBrickTypeDTO } from './dto/create-brick-type.dto';
import { UpdateBrickTypeDTO } from './dto/update-brick-type.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';

@Controller('brick-type')
export class BrickTypeController {
    constructor(private readonly brickTypeService: BrickTypeService) { }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() dto: CreateBrickTypeDTO) {
        return this.brickTypeService.create(dto);
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll(
        @Query('workshopId') workshopId?: string,
        @Query('type') type?: string,
        @Query('isActive') isActive?: string,
    ) {
        const parsedIsActive =
            typeof isActive === 'string' ? (isActive === 'true' ? true : isActive === 'false' ? false : undefined) : undefined;

        return this.brickTypeService.findAll({
            workshopId,
            type,
            isActive: parsedIsActive,
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
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrickTypeDTO) {
        return this.brickTypeService.update(id, dto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brickTypeService.remove(id);
    }
}
