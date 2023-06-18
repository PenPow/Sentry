/*
  Warnings:

  - You are about to drop the column `type` on the `Moderation` table. All the data in the column will be lost.
  - Added the required column `action` to the `Moderation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CaseAction" AS ENUM ('Warn');

-- AlterTable
ALTER TABLE "Moderation" DROP COLUMN "type",
ADD COLUMN     "action" "CaseAction" NOT NULL;

-- DropEnum
DROP TYPE "PunishmentType";
