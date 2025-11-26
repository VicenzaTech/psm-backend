import { Module } from '@nestjs/common';
import { ProductionLineService } from './production-line.service';
import { ProductionLineController } from './production-line.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from '../common/redis/redis.module';
import { BrickTypeModule } from 'src/brick-type/brick-type.module';

@Module({
    imports: [PrismaModule, AuthModule, RedisModule],
    controllers: [ProductionLineController],
    providers: [ProductionLineService],
    exports: [ProductionLineService]
})
export class ProductionLineModule { }
