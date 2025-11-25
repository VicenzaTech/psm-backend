import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { Pagination_Helper } from 'src/common/type/pagination.type';
import { AuthGuard } from 'src/auth/guard/auth/auth.guard';

@Controller('activity-log')
export class ActivityLogController {
    constructor(
        private activityLogService: ActivityLogService
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    async findAll(
        @Query('actionType') actionType?: string,
        @Query('entityType') entityType?: string,
        @Query('userId') userId?: number,
        @Query() query?: any
    ) {
        const pagination = Pagination_Helper.extractDefaultFromQuery(query)
        return await this.activityLogService.findAll({
            ...pagination,
            actionType,
            entityType,
            userId
        })
    }
}
