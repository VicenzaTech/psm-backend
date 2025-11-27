import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductionLineDTO {
  @IsNumber()
  @IsOptional()
  workshopId?: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  iotClusterId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
