/*
  Warnings:

  - You are about to drop the column `people_count` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'RUB';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "people_count",
ADD COLUMN     "parent_id" INTEGER;
