-- Add assessment scheduling support
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "assessment_schedules" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "primaryAssessorId" TEXT NOT NULL,
  "secondaryAssessorId" TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "notes" TEXT,
  "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "assessment_schedules_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "assessment_schedules"
ADD CONSTRAINT "assessment_schedules_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "students"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assessment_schedules"
ADD CONSTRAINT "assessment_schedules_primaryAssessorId_fkey"
FOREIGN KEY ("primaryAssessorId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assessment_schedules"
ADD CONSTRAINT "assessment_schedules_secondaryAssessorId_fkey"
FOREIGN KEY ("secondaryAssessorId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "assessment_schedules_studentId_idx" ON "assessment_schedules"("studentId");
CREATE INDEX "assessment_schedules_primaryAssessorId_idx" ON "assessment_schedules"("primaryAssessorId");
CREATE INDEX "assessment_schedules_secondaryAssessorId_idx" ON "assessment_schedules"("secondaryAssessorId");
CREATE INDEX "assessment_schedules_scheduledAt_idx" ON "assessment_schedules"("scheduledAt");
