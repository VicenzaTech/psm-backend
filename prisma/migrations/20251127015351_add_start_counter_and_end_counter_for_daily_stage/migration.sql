/*
  Warnings:

  - The values [B,C] on the enum `Shift` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Shift_new" AS ENUM ('D', 'N', 'A');
ALTER TABLE "daily_stage_productions" ALTER COLUMN "shift" TYPE "Shift_new" USING ("shift"::text::"Shift_new");
ALTER TABLE "quality_records" ALTER COLUMN "shift" TYPE "Shift_new" USING ("shift"::text::"Shift_new");
ALTER TYPE "Shift" RENAME TO "Shift_old";
ALTER TYPE "Shift_new" RENAME TO "Shift";
DROP TYPE "public"."Shift_old";
COMMIT;

-- AlterTable
ALTER TABLE "daily_stage_productions" ADD COLUMN     "end_counter" DECIMAL(10,2),
ADD COLUMN     "start_counter" DECIMAL(10,2);
