import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWorkshopDTO {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
