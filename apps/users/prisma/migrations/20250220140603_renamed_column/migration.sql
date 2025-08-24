/*
  Warnings:

  - You are about to drop the column `duration` on the `plans` table. All the data in the column will be lost.
  - Added the required column `months` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "duration",
ADD COLUMN     "months" INTEGER NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 150;
