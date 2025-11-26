import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { StageDeviceMappingService } from './stage-device-mapping.service';
import { CreateStageDeviceMapping } from './dto/create-stage-device-mapping.dto';
import { UpdateStageDeviceMapping } from './dto/update-stage-device-mapping.dto';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';
import { UpdateStageDevieMappingStatus } from './dto/update-stage-device-mapping-status.dto';

@Controller('stage-device-mapping')
@UseGuards(AuthGuard)
export class StageDeviceMappingController {
    constructor(private readonly stageDeviceMappingService: StageDeviceMappingService) { }
    @Get()
    async getAllDeviceMapping() {
        return await this.stageDeviceMappingService.findAllDeviceMapping()
    }

    @Get('/active')
    async getAllActiveDeviceMapping() {
        return await this.stageDeviceMappingService.findAllActiveDeviceMapping()
    }

    @Get('/line/:productionLineId')
    async getByProductionLine(@Param('productionLineId', ParseIntPipe) productionLineId: number) {
        return await this.stageDeviceMappingService.getMappingsByProductionLine(productionLineId);
    }

    @Get(':id')
    async getDeviceMapping(@Param('id', ParseIntPipe) id: number) {
        return await this.stageDeviceMappingService.getDeviceMappingById(id);
    }

    @Post()
    async createDeviceMapping(@Body() body: CreateStageDeviceMapping) {
        return await this.stageDeviceMappingService.createDeviceMapping(body)
    }

    @Patch(':id')
    async updateDeviceMapping(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStageDeviceMapping) {
        return await this.stageDeviceMappingService.updateDeviceMapping(id, body);
    }

    @Patch(':id/status')
    async updateStageStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStageDevieMappingStatus) {
        return await this.stageDeviceMappingService.updateStageStatus(id, body)
    }

    @Delete(':id')
    async removeDeviceMapping(@Param('id', ParseIntPipe) id: number) {
        return await this.stageDeviceMappingService.removeDeviceMapping(id);
    }

    @Patch(':id/active')
    async activeDeviceMapping(@Param('id', ParseIntPipe) id: number) {
        return await this.stageDeviceMappingService.activateDeviceMapping(id);
    }
}
