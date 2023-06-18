/*
  Warnings:

  - A unique constraint covering the columns `[guildId,caseId]` on the table `Moderation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Moderation_guildId_caseId_key" ON "Moderation"("guildId", "caseId");
