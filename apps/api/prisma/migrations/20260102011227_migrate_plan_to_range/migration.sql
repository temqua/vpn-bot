/*
  Warnings:

  - You are about to drop the column `people_count` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "people_count",
ADD COLUMN     "max_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "min_count" INTEGER NOT NULL DEFAULT 1;
