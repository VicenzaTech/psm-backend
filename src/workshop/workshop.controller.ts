import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDTO } from './dto/create-workshop.dto';
import { UpdateWorkshopDTO } from './dto/update-workshop.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';

@Controller('workshop')
@UseGuards(AuthGuard)
export class WorkshopController {
    constructor(private readonly workshopService: WorkshopService) { }

    @Post()
    create(@Body() dto: CreateWorkshopDTO) {
        return this.workshopService.create(dto);
    }

    @Get()
    findAll(@Query('isActive') isActive?: string) {
        const parsedIsActive =
            typeof isActive === 'string'
                ? isActive === 'true'
                    ? true
                    : isActive === 'false'
                        ? false
                        : undefined
                : undefined;

        return this.workshopService.findAll({
            isActive: parsedIsActive,
        });
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.workshopService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkshopDTO) {
        return this.workshopService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.workshopService.remove(id);
    }
}
