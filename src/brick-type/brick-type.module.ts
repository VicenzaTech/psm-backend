import { Module } from '@nestjs/common';
import { BrickTypeService } from './brick-type.service';
import { BrickTypeController } from './brick-type.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [BrickTypeService],
  controllers: [BrickTypeController],
})
export class BrickTypeModule {}
