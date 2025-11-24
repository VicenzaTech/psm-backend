import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { BrickTypeService } from './brick-type.service';
import { CreateBrickTypeDTO } from './dto/create-brick-type.dto';
import { UpdateBrickTypeDTO } from './dto/update-brick-type.dto';

@Controller('brick-type')
export class BrickTypeController {
    constructor(private readonly brickTypeService: BrickTypeService) { }

    @Post()
    create(@Body() dto: CreateBrickTypeDTO) {
        return this.brickTypeService.create(dto);
    }

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

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brickTypeService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrickTypeDTO) {
        return this.brickTypeService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brickTypeService.remove(id);
    }
}
