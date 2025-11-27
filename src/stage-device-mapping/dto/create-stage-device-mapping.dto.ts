import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Stage } from '../stage.enum';

export class CreateStageDeviceMapping {
  @IsNumber()
  productionLineId: number;

  @IsEnum(Stage, {
    message:
      'Công đoạn phải là một trong: "EP", "NUNG", "NUNG_MEN", "NUNG_SUONG", "MAI", "DONG_HOP"',
  })
  @IsNotEmpty({ message: 'Chưa điền công đoạn cần thêm vào' })
  stage: Stage;

  @IsNumber()
  measurementPosition: number;

  @IsString()
  @IsNotEmpty({ message: 'Thông tin thiết bị không được để trống' })
  iotDeviceId: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Thông tin log thiết bị không được để trống' })
  iotMeasurementTypeId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
