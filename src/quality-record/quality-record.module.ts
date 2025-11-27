import { Module } from '@nestjs/common';
import { QualityRecordService } from './quality-record.service';
import { QualityRecordController } from './quality-record.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [QualityRecordService],
  controllers: [QualityRecordController],
  imports: [PrismaModule],
})
export class QualityRecordModule {}
