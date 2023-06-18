-- AlterTable
ALTER TABLE "Moderation" ADD COLUMN     "caseReferenceId" TEXT;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_caseReferenceId_fkey" FOREIGN KEY ("caseReferenceId") REFERENCES "Moderation"("caseId") ON DELETE SET NULL ON UPDATE CASCADE;
