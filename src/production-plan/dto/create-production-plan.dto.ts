import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateProductionPlanDTO {
  @IsString()
  @IsNotEmpty({ message: 'Mã kế hoạch không được để trống' })
  @MaxLength(99, { message: 'Mã kế hoạch không được dài quá 100 ký tự' })
  planCode: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Phải chọn dây chuyền thực hiện kế hoạch' })
  productionLineId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Phải chọn dạng gạch tương ứng với kế hoạch' })
  brickTypeId: number;

  @IsDate({ message: 'Ngày bắt đầu phải là thời gian hợp lệ' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: Date;

  @IsDate({ message: 'Ngày kết thúc phải là thời gian hợp lệ' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: Date;

  @IsNumber()
  @IsNotEmpty({ message: 'Sản lượng mục tiêu không được để trống' })
  targetQuantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(256, { message: 'Khách hàng không được dài quá 256 ký tự' })
  customer?: string;
}
