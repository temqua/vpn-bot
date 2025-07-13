/*
  Warnings:

  - The `protocols` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `spendings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "vpn_protocol" AS ENUM ('WireGuard', 'IKEv2', 'Outline', 'VLess');

-- CreateEnum
CREATE TYPE "expense_category" AS ENUM ('Nalog', 'Servers');

ALTER TABLE "users" ALTER COLUMN "protocols" DROP DEFAULT;
-- AlterTable
ALTER TABLE "users" ALTER COLUMN protocols TYPE vpn_protocol[] USING protocols::text[]::vpn_protocol[];
ALTER TABLE "users" 
  ALTER COLUMN "protocols" 
  SET DEFAULT '{}';


ALTER TABLE "spendings" RENAME TO "expenses";
ALTER TABLE "expenses" RENAME CONSTRAINT "spendings_pkey" TO "expenses_pkey";
ALTER TABLE "expenses" 
ALTER COLUMN category TYPE "expense_category" USING category::text::"expense_category";
-- DropEnum
DROP TYPE "SpendingCategory";

-- DropEnum
DROP TYPE "VPNProtocol";
