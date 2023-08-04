-- AlterTable
ALTER TABLE "Infraction" ALTER COLUMN "expiration" DROP NOT NULL,
ALTER COLUMN "expiration" DROP DEFAULT;
