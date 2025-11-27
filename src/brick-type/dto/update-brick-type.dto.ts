import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LoaiMai } from '@prisma/client';

export class UpdateBrickTypeDTO {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  size_x?: number;

  @IsNumber()
  @IsOptional()
  size_y?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsEnum(LoaiMai)
  @IsOptional()
  loaiMai?: LoaiMai;

  @IsNumber()
  @IsOptional()
  thoiGianChoMaiNguoiHours?: number;

  @IsString()
  @IsOptional()
  workshopId?: string;

  @IsString()
  @IsOptional()
  productionLineId?: string;

  @IsNumber()
  @IsOptional()
  chuKyKhoan?: number;

  @IsNumber()
  @IsOptional()
  sanLuongRaLoPerDay?: number;

  @IsNumber()
  @IsOptional()
  sanLuongChinhPhamPerDay?: number;

  @IsNumber()
  @IsOptional()
  soNgayTruKhoan?: number;

  @IsNumber()
  @IsOptional()
  sanLuongKhoan30Ngay?: number;

  @IsNumber()
  @IsOptional()
  sanLuongKhoan31Ngay?: number;

  @IsNumber()
  @IsOptional()
  congKhoanGiamChuKy?: number;

  @IsNumber()
  @IsOptional()
  giamKhoanTangChuKy?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
