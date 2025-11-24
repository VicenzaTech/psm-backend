/*
  Warnings:

  - You are about to drop the column `donGiaPhatSanLuong` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `donGiaThuongA1` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `donGiaThuongA2` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `donGiaThuongCatLo` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLeA1Khoan` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLeA2Khoan` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLeCatLoKhoan` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLePhe1Khoan` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLePhe2Khoan` on the `BrickType` table. All the data in the column will be lost.
  - You are about to drop the column `tyLePheHuyKhoan` on the `BrickType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BrickType" DROP COLUMN "donGiaPhatSanLuong",
DROP COLUMN "donGiaThuongA1",
DROP COLUMN "donGiaThuongA2",
DROP COLUMN "donGiaThuongCatLo",
DROP COLUMN "tyLeA1Khoan",
DROP COLUMN "tyLeA2Khoan",
DROP COLUMN "tyLeCatLoKhoan",
DROP COLUMN "tyLePhe1Khoan",
DROP COLUMN "tyLePhe2Khoan",
DROP COLUMN "tyLePheHuyKhoan";
