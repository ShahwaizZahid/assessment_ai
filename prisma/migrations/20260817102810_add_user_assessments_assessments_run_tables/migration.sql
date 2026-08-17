-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('draft', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'draft',
    "intake_data" JSONB NOT NULL DEFAULT '{}',
    "final_report" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_runs" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input_data" JSONB NOT NULL DEFAULT '{}',
    "output_data" JSONB,
    "error_message" TEXT,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "assessments_user_id_idx" ON "assessments"("user_id");

-- CreateIndex
CREATE INDEX "assessment_runs_assessment_id_idx" ON "assessment_runs"("assessment_id");

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_runs" ADD CONSTRAINT "assessment_runs_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
