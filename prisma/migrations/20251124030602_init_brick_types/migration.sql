-- CreateTable
CREATE TABLE "brick_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "size_X" INTEGER NOT NULL,
    "size_Y" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "cycle_time_minutes" INTEGER NOT NULL,
    "output_per_cycle_m2" DECIMAL(10,2) NOT NULL,
    "finished_product_per_cycle_m2" DECIMAL(10,2) NOT NULL,
    "quality_standards" JSONB,
    "workshop" VARCHAR(50) NOT NULL,
    "productionLine" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brick_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brick_types_code_idx" ON "brick_types"("code");

-- CreateIndex
CREATE INDEX "brick_types_workshop_productionLine_idx" ON "brick_types"("workshop", "productionLine");

-- CreateIndex
CREATE INDEX "brick_types_is_active_idx" ON "brick_types"("is_active");
