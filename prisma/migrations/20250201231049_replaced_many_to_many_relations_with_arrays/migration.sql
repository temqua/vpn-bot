/*
  Warnings:

  - You are about to drop the `user_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_protocols` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_devices" DROP CONSTRAINT "user_devices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_protocols" DROP CONSTRAINT "user_protocols_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "devices" "Device"[] DEFAULT ARRAY[]::"Device"[],
ADD COLUMN     "protocols" "VPNProtocol"[] DEFAULT ARRAY[]::"VPNProtocol"[];

-- DropTable
DROP TABLE "user_devices";

-- DropTable
DROP TABLE "user_protocols";
