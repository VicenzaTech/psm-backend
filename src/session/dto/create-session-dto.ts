import { IsNumber, IsString } from "class-validator";

export class CreateSessionDTO {
    @IsNumber()
    userId: number;
    @IsString()
    userAgent: string;
    @IsString()
    ip: string;
    @IsNumber()
    ttlSeconds: number;
    @IsString()
    refreshToken: string;
}