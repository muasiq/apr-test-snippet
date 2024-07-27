
-- DropForeignKey
ALTER TABLE "NurseConfirmedOasisSections" DROP CONSTRAINT "NurseConfirmedOasisSections_patientId_fkey";

-- DropForeignKey
ALTER TABLE "OasisAnswer" DROP CONSTRAINT "OasisAnswer_checkedById_fkey";

-- DropForeignKey
ALTER TABLE "OasisAnswer" DROP CONSTRAINT "OasisAnswer_patientId_fkey";

-- Rename
ALTER TABLE "NurseConfirmedOasisSections" RENAME TO "NurseConfirmedAssessmentSections";
ALTER TABLE "OasisAnswer" RENAME TO "AssessmentAnswer";

ALTER TABLE "AssessmentAnswer" RENAME COLUMN "oasisNumber" TO "assessmentNumber";

ALTER TYPE "OasisAnswerSuggestionStatus" RENAME TO "AssessmentAnswerSuggestionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "NurseConfirmedAssessmentSections_patientId_section_key" ON "NurseConfirmedAssessmentSections"("patientId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAnswer_patientId_assessmentNumber_source_key" ON "AssessmentAnswer"("patientId", "assessmentNumber", "source");

-- AddForeignKey
ALTER TABLE "NurseConfirmedAssessmentSections" ADD CONSTRAINT "NurseConfirmedAssessmentSections_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AlterTable
ALTER TABLE "AssessmentAnswer" RENAME CONSTRAINT "OasisAnswer_pkey" TO "AssessmentAnswer_pkey";

-- AlterTable
ALTER TABLE "NurseConfirmedAssessmentSections" RENAME CONSTRAINT "NurseConfirmedOasisSections_pkey" TO "NurseConfirmedAssessmentSections_pkey";
