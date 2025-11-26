import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
    imports: [PrismaModule, AuthModule, RedisModule],
    providers: [WorkshopService],
    controllers: [WorkshopController],
})
export class WorkshopModule { }
