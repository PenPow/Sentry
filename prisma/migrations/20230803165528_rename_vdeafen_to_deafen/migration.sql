/*
  Warnings:

  - The values [VDeafen] on the enum `CaseAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CaseAction_new" AS ENUM ('Warn', 'Timeout', 'Kick', 'Softban', 'Ban', 'Unban', 'Untimeout', 'VMute', 'Deafen');
ALTER TABLE "Infraction" ALTER COLUMN "action" TYPE "CaseAction_new" USING ("action"::text::"CaseAction_new");
ALTER TYPE "CaseAction" RENAME TO "CaseAction_old";
ALTER TYPE "CaseAction_new" RENAME TO "CaseAction";
DROP TYPE "CaseAction_old";
COMMIT;
