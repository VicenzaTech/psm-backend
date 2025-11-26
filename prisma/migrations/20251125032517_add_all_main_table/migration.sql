-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('auto_sync', 'manual_input', 'adjusted');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('EP', 'NUNG', 'MAI', 'DONG_HOP');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "workshops" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" SERIAL NOT NULL,
    "workshop_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iot_cluster_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_device_mappings" (
    "id" SERIAL NOT NULL,
    "production_line_id" INTEGER NOT NULL,
    "stage" "Stage" NOT NULL,
    "measurement_position" VARCHAR(100) NOT NULL,
    "iot_device_id" VARCHAR(100) NOT NULL,
    "iot_measurement_type_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "stage_device_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plans" (
    "id" SERIAL NOT NULL,
    "plan_code" VARCHAR(100) NOT NULL,
    "production_line_id" INTEGER NOT NULL,
    "brick_type_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "target_quantity" DECIMAL(10,2) NOT NULL,
    "actual_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_by" VARCHAR(100) NOT NULL,
    "approved_by" VARCHAR(100),
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_assignments" (
    "id" SERIAL NOT NULL,
    "production_line_id" INTEGER NOT NULL,
    "production_plan_id" INTEGER NOT NULL,
    "brick_type_id" INTEGER NOT NULL,
    "stage" "Stage" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ(6),
    "actual_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "target_quantity" DECIMAL(10,2),
    "notes" TEXT,
    "created_by" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "stage_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stage_productions" (
    "id" SERIAL NOT NULL,
    "stage_assignment_id" INTEGER NOT NULL,
    "production_date" DATE NOT NULL,
    "shift" "Shift",
    "actual_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "waste_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "data_source" "DataSource" NOT NULL DEFAULT 'auto_sync',
    "recorded_by" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_stage_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_records" (
    "id" SERIAL NOT NULL,
    "production_plan_id" INTEGER NOT NULL,
    "stage_assignment_id" INTEGER,
    "record_date" DATE NOT NULL,
    "shift" "Shift",
    "sl_A1" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_A2" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_cat_lo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_phe_1" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_phe_2" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_phe_huy" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recorded_by" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quality_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_cache" (
    "id" UUID NOT NULL,
    "stage_assignment_id" INTEGER,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "device_id" INTEGER NOT NULL,
    "measurement_type_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurement_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workshops_code_key" ON "workshops"("code");

-- CreateIndex
CREATE INDEX "production_lines_workshop_id_idx" ON "production_lines"("workshop_id");

-- CreateIndex
CREATE INDEX "production_lines_code_idx" ON "production_lines"("code");

-- CreateIndex
CREATE INDEX "stage_device_mappings_production_line_id_stage_idx" ON "stage_device_mappings"("production_line_id", "stage");

-- CreateIndex
CREATE INDEX "stage_device_mappings_iot_device_id_idx" ON "stage_device_mappings"("iot_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_plans_plan_code_key" ON "production_plans"("plan_code");

-- CreateIndex
CREATE INDEX "production_plans_production_line_id_start_date_end_date_idx" ON "production_plans"("production_line_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "production_plans_status_idx" ON "production_plans"("status");

-- CreateIndex
CREATE INDEX "stage_assignments_production_line_id_stage_is_active_idx" ON "stage_assignments"("production_line_id", "stage", "is_active");

-- CreateIndex
CREATE INDEX "stage_assignments_production_plan_id_stage_idx" ON "stage_assignments"("production_plan_id", "stage");

-- CreateIndex
CREATE INDEX "stage_assignments_is_active_start_time_idx" ON "stage_assignments"("is_active", "start_time");

-- CreateIndex
CREATE INDEX "daily_stage_productions_stage_assignment_id_production_date_idx" ON "daily_stage_productions"("stage_assignment_id", "production_date");

-- CreateIndex
CREATE INDEX "daily_stage_productions_production_date_idx" ON "daily_stage_productions"("production_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stage_productions_stage_assignment_id_production_date_key" ON "daily_stage_productions"("stage_assignment_id", "production_date", "shift");

-- CreateIndex
CREATE INDEX "quality_records_production_plan_id_record_date_idx" ON "quality_records"("production_plan_id", "record_date");

-- CreateIndex
CREATE INDEX "quality_records_record_date_idx" ON "quality_records"("record_date");

-- CreateIndex
CREATE INDEX "measurement_cache_stage_assignment_id_timestamp_idx" ON "measurement_cache"("stage_assignment_id", "timestamp");

-- CreateIndex
CREATE INDEX "measurement_cache_device_id_timestamp_idx" ON "measurement_cache"("device_id", "timestamp");

-- CreateIndex
CREATE INDEX "measurement_cache_device_id_measurement_type_id_timestamp_idx" ON "measurement_cache"("device_id", "measurement_type_id", "timestamp");

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_device_mappings" ADD CONSTRAINT "stage_device_mappings_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plans" ADD CONSTRAINT "production_plans_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plans" ADD CONSTRAINT "production_plans_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "BrickType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_assignments" ADD CONSTRAINT "stage_assignments_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_assignments" ADD CONSTRAINT "stage_assignments_production_plan_id_fkey" FOREIGN KEY ("production_plan_id") REFERENCES "production_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_assignments" ADD CONSTRAINT "stage_assignments_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "BrickType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_stage_productions" ADD CONSTRAINT "daily_stage_productions_stage_assignment_id_fkey" FOREIGN KEY ("stage_assignment_id") REFERENCES "stage_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_production_plan_id_fkey" FOREIGN KEY ("production_plan_id") REFERENCES "production_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_stage_assignment_id_fkey" FOREIGN KEY ("stage_assignment_id") REFERENCES "stage_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_cache" ADD CONSTRAINT "measurement_cache_stage_assignment_id_fkey" FOREIGN KEY ("stage_assignment_id") REFERENCES "stage_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
