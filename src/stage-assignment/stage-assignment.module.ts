import { Module } from '@nestjs/common';
import { StageAssignmentService } from './stage-assignment.service';
import { StageAssignmentController } from './stage-assignment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [StageAssignmentService],
  controllers: [StageAssignmentController],
  exports: [StageAssignmentService],
})
export class StageAssignmentModule { }
