import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductionLineDTO {
    @IsNumber()
    @IsNotEmpty()
    workshopId: number;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    iotClusterId: number;
}

