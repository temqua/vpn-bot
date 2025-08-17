/*
  Warnings:

  - The values [Android_TV,Google_TV] on the enum `Device` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Device_new" AS ENUM ('Android', 'iOS', 'macOS', 'Linux', 'Windows', 'AndroidTV', 'GoogleTV', 'AppleTV');
ALTER TABLE "users" ALTER COLUMN "devices" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "devices" TYPE "Device_new"[] USING ("devices"::text::"Device_new"[]);
ALTER TYPE "Device" RENAME TO "Device_old";
ALTER TYPE "Device_new" RENAME TO "Device";
DROP TYPE "Device_old";
ALTER TABLE "users" ALTER COLUMN "devices" SET DEFAULT ARRAY[]::"Device"[];
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "expires_on" TIMESTAMP(3),
ADD COLUMN     "months_count" INTEGER;
