-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_studentId_fkey";

-- AlterTable
ALTER TABLE "evaluations" ALTER COLUMN "studentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
