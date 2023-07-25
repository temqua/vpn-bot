/*
  Warnings:

  - You are about to drop the column `payed_months_count` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "payed_months_count",
ADD COLUMN     "paid_months_count" INTEGER DEFAULT 0;
