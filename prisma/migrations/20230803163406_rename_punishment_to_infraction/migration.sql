/*
  Warnings:

  - You are about to drop the `Punishment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Punishment" DROP CONSTRAINT "Punishment_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Punishment" DROP CONSTRAINT "Punishment_referenceId_fkey";

-- DropTable
DROP TABLE "Punishment";

-- CreateTable
CREATE TABLE "Infraction" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "guildId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL DEFAULT '934121887829737562',
    "moderatorName" TEXT NOT NULL DEFAULT 'Sentry',
    "moderatorIconUrl" TEXT NOT NULL DEFAULT 'https://github.com/PenPow/Sentry/blob/main/branding/SquareLogoNoText.png?raw=true',
    "reason" TEXT NOT NULL,
    "modLogMessageId" TEXT,
    "action" "CaseAction" NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceId" INTEGER,
    "userName" TEXT NOT NULL,
    "frozen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Infraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Infraction_id_key" ON "Infraction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Infraction_guildId_caseId_key" ON "Infraction"("guildId", "caseId");

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Infraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
