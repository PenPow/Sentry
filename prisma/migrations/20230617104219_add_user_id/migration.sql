/*
  Warnings:

  - Added the required column `userId` to the `Moderation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Moderation" ADD COLUMN     "userId" TEXT NOT NULL;
