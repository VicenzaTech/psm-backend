import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationDTO } from 'src/common/type/pagination.type';
import { LogDTO } from './dto/log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityEntityType, ActivityStatus } from './activity-log.enum';
@Injectable()
export class ActivityLogService {
    constructor(
        private prisma: PrismaService,
    ) { }

    // FIND
    async findAll(dto: PaginationDTO & {
        actionType?: string,
        entityType?: string,
        userId?: number
    }) {
        const {
            page,
            limit,
            sort,
            order,
            actionType,
            entityType,
            userId,
        } = dto

        const where: any = {}
     
        if (actionType) {
            where.actionType = actionType
        }

        if (entityType) {
            where.entityType = entityType
        }

        if (typeof userId === 'number') {
            where.userId = userId
        }

        const skip = (page - 1) * limit

        const [items, total] = await this.prisma.$transaction([
            this.prisma.activityLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: sort
                    ? { [sort]: order ?? 'asc' }
                    : { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count({ where }),
        ])

        return {
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }
    // CREATE LOG
    async log(dto: LogDTO) {
        return await this.prisma.activityLog.create({
            data: dto
        })
    }

    async logSuccessful(dto: LogDTO) {
        return this.log({
            ...dto,
            status: ActivityStatus.SUCCESS
        })
    }

    async logFailed(dto: LogDTO) {
        return this.log({
            ...dto,
            status: ActivityStatus.FAILED
        })
    }
}
