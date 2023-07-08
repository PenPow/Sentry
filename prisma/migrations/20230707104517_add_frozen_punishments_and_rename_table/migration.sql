/*
  Warnings:

  - You are about to drop the `Moderation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_referenceId_fkey";

-- DropTable
DROP TABLE "Moderation";

-- CreateTable
CREATE TABLE "Punishment" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "guildId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL DEFAULT '934121887829737562',
    "reason" TEXT NOT NULL,
    "modLogMessageId" TEXT,
    "action" "CaseAction" NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceId" INTEGER,
    "userName" TEXT NOT NULL,
    "frozen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Punishment_id_key" ON "Punishment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Punishment_guildId_caseId_key" ON "Punishment"("guildId", "caseId");

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Punishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
