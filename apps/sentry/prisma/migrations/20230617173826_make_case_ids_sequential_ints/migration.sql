/*
  Warnings:

  - The primary key for the `Moderation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `caseReferenceId` column on the `Moderation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `caseId` on the `Moderation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_caseReferenceId_fkey";

-- AlterTable
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_pkey",
DROP COLUMN "caseId",
ADD COLUMN     "caseId" INTEGER NOT NULL,
DROP COLUMN "caseReferenceId",
ADD COLUMN     "caseReferenceId" INTEGER,
ADD CONSTRAINT "Moderation_pkey" PRIMARY KEY ("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Moderation_caseId_key" ON "Moderation"("caseId");

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_caseReferenceId_fkey" FOREIGN KEY ("caseReferenceId") REFERENCES "Moderation"("caseId") ON DELETE SET NULL ON UPDATE CASCADE;
