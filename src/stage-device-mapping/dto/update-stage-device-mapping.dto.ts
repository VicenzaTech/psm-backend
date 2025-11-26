import { IsEnum, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Stage } from '../stage.enum';

export class UpdateStageDeviceMapping {
    @IsNumber()
    @IsOptional()
    productionLineId?: number;

    @IsEnum(Stage, {
        message:
            'Công đoạn phải là một trong: "EP", "NUNG", "NUNG_MEN", "NUNG_SUONG", "MAI", "DONG_HOP"',
    })
    @IsOptional()
    stage?: Stage;

    // FIND FROM DB IN SERVICE
    @IsNumber()
    @IsOptional()
    measurementPosition?: number;

    @IsString()
    @IsOptional()
    iotDeviceId?: string;

    @IsNumber()
    @IsOptional()
    iotMeasurementTypeId?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

