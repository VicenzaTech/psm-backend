import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [PrismaModule, RedisModule]
})
export class UserModule {}
