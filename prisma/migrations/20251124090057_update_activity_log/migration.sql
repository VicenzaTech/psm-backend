/*
  Warnings:

  - You are about to drop the column `user_full_name` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `activity_logs` table. All the data in the column will be lost.
  - The `entity_type` column on the `activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `severity` to the `activity_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `activity_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `activity_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('User', 'BrickType', 'ProductionPlan', 'StageAssignment', 'DailyStageProduction', 'QualityRecord', 'MeasurementCache', 'Workshop', 'ProductionLine', 'Device', 'DeviceCluster', 'Setting', 'Other', 'Attachment', 'ApiToken', 'MeasurementType', 'SalaryPeriod');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ActivitySeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SECURITY');

-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('WEB_ADMIN', 'WEB_APP', 'API', 'IOT_SYNC', 'JOB', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_fkey";

-- DropIndex
DROP INDEX "activity_logs_action_type_idx";

-- DropIndex
DROP INDEX "activity_logs_entity_type_entity_id_idx";

-- DropIndex
DROP INDEX "activity_logs_user_id_idx";

-- AlterTable
ALTER TABLE "activity_logs" DROP COLUMN "user_full_name",
DROP COLUMN "username",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "severity" "ActivitySeverity" NOT NULL,
ADD COLUMN     "source" "ActivitySource" NOT NULL,
ADD COLUMN     "status" "ActivityStatus" NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "action" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "action_type" SET DATA TYPE TEXT,
DROP COLUMN "entity_type",
ADD COLUMN     "entity_type" "ActivityEntityType",
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_created_at_idx" ON "activity_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_action_type_created_at_idx" ON "activity_logs"("action_type", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_source_created_at_idx" ON "activity_logs"("source", "created_at");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
