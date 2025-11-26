import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductionBackendService } from './production-backend.service';
import { 
  BRICK_COUNTER_DEVICE, 
  BRICK_COUNTER_MEASUREMENT_TYPE, 
  BRICK_COUNTER_POSITION, 
  BRICK_COUNTER_PRODUCTION_LINE 
} from '../common/BRICK_COUNTER_COMMON';

// @ApiTags('production-backend')
@Controller('production-backend')
// @UseGuards(JwtAuthGuard)
export class ProductionBackendController {
    constructor(private readonly productionBackendService: ProductionBackendService) {}

    @Get('devices/:deviceId')
    async getDeviceByDeviceId(@Param('deviceId') deviceId: string) {
        return this.productionBackendService.getDeviceByDeviceId(deviceId);
    }

    @Get('measurement-types/:id')
    
    async getMeasurementTypeById(@Param('id') id: number) {
        return this.productionBackendService.getMeasurementTypeById(Number(id));
    }

    @Get('positions/:id')
    
    async getPositionById(@Param('id') id: number) {
        return this.productionBackendService.getPositionById(Number(id));
    }

    @Get('production-lines/:id')
   
    async getProductionLineById(@Param('id') id: number) {
        return this.productionBackendService.getProductionLineById(Number(id));
    }
}