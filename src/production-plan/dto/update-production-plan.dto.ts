import {
  IsDate,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductionPlanDTO {
  @IsString()
  @IsOptional()
  @MaxLength(99, { message: 'Mã kế hoạch không được dài quá 100 ký tự' })
  planCode?: string;

  @IsNumber()
  @IsOptional()
  productionLineId?: number;

  @IsNumber()
  @IsOptional()
  brickTypeId?: number;

  @IsDate({ message: 'Ngày bắt đầu phải là thời gian hợp lệ' })
  @IsOptional()
  startDate?: Date;

  @IsDate({ message: 'Ngày kết thúc phải là thời gian hợp lệ' })
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  targetQuantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(256, { message: 'Khách hàng không được dài quá 256 ký tự' })
  customer?: string;
}
