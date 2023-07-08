-- AlterTable
ALTER TABLE "Punishment" ADD COLUMN     "moderatorIconUrl" TEXT NOT NULL DEFAULT 'https://github.com/PenPow/Sentry/blob/main/branding/SquareLogoNoText.png?raw=true',
ADD COLUMN     "moderatorName" TEXT NOT NULL DEFAULT 'Sentry';
