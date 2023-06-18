/*
  Warnings:

  - The primary key for the `Moderation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `caseReferenceId` on the `Moderation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Moderation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Moderation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_caseReferenceId_fkey";

-- DropIndex
DROP INDEX "Moderation_caseId_key";

-- AlterTable
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_pkey",
DROP COLUMN "caseReferenceId",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD COLUMN     "referenceId" INTEGER,
ADD CONSTRAINT "Moderation_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Moderation_id_key" ON "Moderation"("id");

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Moderation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
