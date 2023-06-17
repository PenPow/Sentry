/*
  Warnings:

  - Added the required column `userName` to the `Moderation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Moderation" ADD COLUMN     "userName" TEXT NOT NULL;
