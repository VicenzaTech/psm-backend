/*
  Warnings:

  - The `measurement_position` column on the `stage_device_mappings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Stage" ADD VALUE 'NUNG_MEN';
ALTER TYPE "Stage" ADD VALUE 'NUNG_SUONG';

-- AlterTable
ALTER TABLE "stage_device_mappings" DROP COLUMN "measurement_position",
ADD COLUMN     "measurement_position" INTEGER,
ALTER COLUMN "iot_device_id" DROP NOT NULL;
