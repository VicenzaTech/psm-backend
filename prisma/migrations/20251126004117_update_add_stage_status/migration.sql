-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('RUNNING', 'WAITING', 'ERROR', 'STOPPED');

-- AlterTable
ALTER TABLE "stage_device_mappings" ADD COLUMN     "stageLiveStatus" "StageStatus" NOT NULL DEFAULT 'WAITING';
