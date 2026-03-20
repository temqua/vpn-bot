/*
  Warnings:

  - You are about to drop the column `ip` on the `vpn_servers` table. All the data in the column will be lost.
  - Added the required column `url` to the `vpn_servers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vpn_servers" DROP COLUMN "ip",
ADD COLUMN     "url" TEXT NOT NULL;
