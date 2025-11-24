import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { LoaiMai } from '@prisma/client';

export class CreateBrickTypeDTO {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    size_x: number;

    @IsNumber()
    @IsNotEmpty()
    size_y: number;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsEnum(LoaiMai)
    loaiMai: LoaiMai;

    @IsNumber()
    thoiGianChoMaiNguoiHours: number;

    @IsString()
    @IsNotEmpty()
    workshopId: string;

    @IsString()
    @IsNotEmpty()
    productionLineId: string;

    @IsNumber()
    @IsNotEmpty()
    chuKyKhoan: number;

    @IsNumber()
    @IsNotEmpty()
    sanLuongRaLoPerDay: number;

    @IsNumber()
    @IsNotEmpty()
    sanLuongChinhPhamPerDay: number;

    @IsNumber()
    @IsNotEmpty()
    soNgayTruKhoan: number;

    @IsNumber()
    @IsNotEmpty()
    sanLuongKhoan30Ngay: number;

    @IsNumber()
    @IsNotEmpty()
    sanLuongKhoan31Ngay: number;

    @IsNumber()
    @IsNotEmpty()
    congKhoanGiamChuKy: number;

    @IsNumber()
    @IsNotEmpty()
    giamKhoanTangChuKy: number;
}

