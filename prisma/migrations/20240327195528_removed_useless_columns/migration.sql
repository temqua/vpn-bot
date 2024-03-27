/*
  Warnings:

  - You are about to drop the column `auto_pay` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paid_months_count` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "auto_pay",
DROP COLUMN "paid_months_count";
