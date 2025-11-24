/*
  Warnings:

  - You are about to drop the `brick_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LoaiMai" AS ENUM ('mai_nong', 'mai_nguoi');

-- DropTable
DROP TABLE "brick_types";

-- CreateTable
CREATE TABLE "BrickType" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "size_x" INTEGER NOT NULL,
    "size_y" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "loaiMai" "LoaiMai" NOT NULL,
    "thoiGianChoMaiNguoiHours" INTEGER,
    "workshopId" TEXT NOT NULL,
    "productionLineId" TEXT NOT NULL,
    "chuKyKhoan" INTEGER NOT NULL,
    "sanLuongRaLoPerDay" DECIMAL(10,2) NOT NULL,
    "sanLuongChinhPhamPerDay" DECIMAL(10,2) NOT NULL,
    "soNgayTruKhoan" DECIMAL(5,2) NOT NULL DEFAULT 1.5,
    "sanLuongKhoan30Ngay" DECIMAL(10,2) NOT NULL,
    "sanLuongKhoan31Ngay" DECIMAL(10,2) NOT NULL,
    "congKhoanGiamChuKy" DECIMAL(10,2) NOT NULL,
    "giamKhoanTangChuKy" DECIMAL(10,2) NOT NULL,
    "tyLeA1Khoan" DECIMAL(5,2) NOT NULL,
    "tyLeA2Khoan" DECIMAL(5,2) NOT NULL,
    "tyLeCatLoKhoan" DECIMAL(5,2) NOT NULL,
    "tyLePhe1Khoan" DECIMAL(5,2) NOT NULL,
    "tyLePhe2Khoan" DECIMAL(5,2) NOT NULL,
    "tyLePheHuyKhoan" DECIMAL(5,2) NOT NULL,
    "donGiaThuongA1" DECIMAL(10,2) NOT NULL,
    "donGiaThuongA2" DECIMAL(10,2) NOT NULL,
    "donGiaThuongCatLo" DECIMAL(10,2) NOT NULL,
    "donGiaPhatSanLuong" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrickType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrickType_code_key" ON "BrickType"("code");
