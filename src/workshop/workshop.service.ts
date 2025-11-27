import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkshopDTO } from './dto/create-workshop.dto';
import { UpdateWorkshopDTO } from './dto/update-workshop.dto';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';
import { OkResponse } from 'src/common/type/response.type';
import { REDIS_PROVIDER } from 'src/common/redis/redis.constant';
import Redis from 'ioredis';
import { CacheVersionService } from 'src/common/redis/cache-version.service';

@Injectable()
export class WorkshopService {
  private readonly logger = new Logger(WorkshopService.name);
  private readonly allCacheScope = 'workshops:all';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_PROVIDER) private readonly redis: Redis,
    private readonly cacheVersionService: CacheVersionService,
  ) {}

  private async getAllCacheKey(): Promise<string> {
    const version = await this.cacheVersionService.getVersion(
      this.allCacheScope,
    );
    return `${this.allCacheScope}:v${version}`;
  }

  private async invalidateAllCache(): Promise<void> {
    try {
      await this.cacheVersionService.bumpVersion(this.allCacheScope);
    } catch (error) {
      this.logger.error('Failed to bump workshop cache version', error?.stack);
    }
  }

  async create(dto: CreateWorkshopDTO) {
    const existing = await this.prisma.workshop.findFirst({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(`Workshop code ${dto.code} already exists`);
    }

    const created = await this.prisma.workshop.create({
      data: dto,
    });

    await this.invalidateAllCache();

    return {
      data: created,
      log: {
        entityType: ActivityEntityType.Workshop,
        action: 'CREATE_WORKSHOP',
        actionType: 'CREATE_WORKSHOP',
        description: `${created.name} đã được tạo mới`,
      },
    } as OkResponse;
  }

  async findAll(params?: { isActive?: boolean }) {
    const { isActive } = params || {};

    const hasExplicitIsActive =
      params && typeof params.isActive !== 'undefined';
    const effectiveIsActive = hasExplicitIsActive ? isActive : true;
    const shouldUseCache = !hasExplicitIsActive || effectiveIsActive === true;

    let cacheKey: string | null = null;
    if (shouldUseCache) {
      try {
        cacheKey = await this.getAllCacheKey();
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        this.logger.error('Failed to read workshops from cache', error?.stack);
      }
    }

    const where: any = {};

    if (typeof effectiveIsActive === 'boolean') {
      where.isActive = effectiveIsActive;
    }

    const result = await this.prisma.workshop.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    if (shouldUseCache && cacheKey) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
      } catch (error) {
        this.logger.error('Failed to write workshops to cache', error?.stack);
      }
    }

    return result;
  }

  async findOne(id: number) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with id ${id} not found`);
    }

    return workshop;
  }

  async update(id: number, dto: UpdateWorkshopDTO) {
    await this.ensureExists(id);

    const updated = await this.prisma.workshop.update({
      where: { id },
      data: dto,
    });

    await this.invalidateAllCache();

    return {
      data: updated,
      log: {
        entityType: ActivityEntityType.Workshop,
        action: 'UPDATE_WORKSHOP',
        actionType: 'UPDATE_WORKSHOP',
        description: `${updated.name} đã được cập nhật`,
      },
    } as OkResponse;
  }

  async remove(id: number) {
    await this.ensureExists(id);

    const updated = await this.prisma.workshop.update({
      where: { id },
      data: { isActive: false },
    });

    await this.invalidateAllCache();

    return {
      data: updated,
      log: {
        entityType: ActivityEntityType.Workshop,
        action: 'DISABLE_WORKSHOP',
        actionType: 'DISABLE_WORKSHOP',
        description: `${updated.name} đã được vô hiệu hóa`,
      },
    } as OkResponse;
  }

  private async ensureExists(id: number): Promise<void> {
    const existing = await this.prisma.workshop.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Workshop with id ${id} not found`);
    }
  }
}
