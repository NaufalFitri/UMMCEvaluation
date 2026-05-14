-- Add secondary assessor support to evaluations
ALTER TABLE "evaluations"
ADD COLUMN "secondaryAssessorId" TEXT;

ALTER TABLE "evaluations"
ADD CONSTRAINT "evaluations_secondaryAssessorId_fkey"
FOREIGN KEY ("secondaryAssessorId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "evaluations_secondaryAssessorId_idx" ON "evaluations"("secondaryAssessorId");
