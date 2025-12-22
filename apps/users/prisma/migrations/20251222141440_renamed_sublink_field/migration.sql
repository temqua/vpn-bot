/*
  Warnings:

  - You are about to drop the column `subLink` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "subLink",
ADD COLUMN     "subscription_url" TEXT DEFAULT '';
