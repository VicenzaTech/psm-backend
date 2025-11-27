import { DataSource, Shift } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertDailyStageProduction {
  @IsNumber()
  @IsNotEmpty({ message: 'Cần nhập vào số liệu thực tế' })
  actualQuantity: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Cần nhập vào số liệu lượng phế' })
  wasteQuantity: number;

  @IsEnum(DataSource, {
    message: 'Nguồn dữ liệu phải thuộc [auto_sync, manual_input, adjusted]',
  })
  @IsNotEmpty()
  dataSource: DataSource = 'auto_sync';

  @IsEnum(Shift, {
    message: 'Ca phải thuộc [A, B, C] hoặc bỏ trống',
  })
  @IsOptional()
  shift?: Shift;

  @IsNumber()
  @IsNotEmpty({ message: 'Cần truyền stageAssignmentId' })
  stageAssignmentId: number;

  @IsString()
  @IsOptional()
  recordedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
