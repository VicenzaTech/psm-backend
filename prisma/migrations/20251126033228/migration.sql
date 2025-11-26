-- AlterTable
ALTER TABLE "BrickType" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "stage_assignments" ADD COLUMN     "status" "StageStatus" NOT NULL DEFAULT 'WAITING';
