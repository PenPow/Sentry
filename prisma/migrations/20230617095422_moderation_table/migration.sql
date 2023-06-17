-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('Warn');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderation" (
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" BIGINT,
    "guildId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL DEFAULT '934121887829737562',
    "reason" TEXT NOT NULL,
    "type" "PunishmentType" NOT NULL,

    CONSTRAINT "Moderation_pkey" PRIMARY KEY ("caseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Moderation_caseId_key" ON "Moderation"("caseId");

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
