/*
  Warnings:

  - You are about to drop the column `hasIPSec` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hasWireGuard` on the `users` table. All the data in the column will be lost.
  - Added the required column `desktopOS` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneOS` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeviceOS" AS ENUM ('Android', 'iOS');

-- CreateEnum
CREATE TYPE "DesktopOS" AS ENUM ('Windows', 'macOS', 'Linux');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "hasIPSec",
DROP COLUMN "hasWireGuard",
ADD COLUMN     "desktopOS" "DesktopOS" NOT NULL,
ADD COLUMN     "phoneOS" "DeviceOS" NOT NULL;
