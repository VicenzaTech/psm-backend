import { Module } from '@nestjs/common';
import { BrickTypeService } from './brick-type.service';
import { BrickTypeController } from './brick-type.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule],
  providers: [BrickTypeService],
  controllers: [BrickTypeController],
  exports: [BrickTypeService],
})
export class BrickTypeModule {}
