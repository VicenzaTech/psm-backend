import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkshopDTO {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

