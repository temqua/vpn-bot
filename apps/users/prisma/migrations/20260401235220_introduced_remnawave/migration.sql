-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rw_id" INTEGER,
ADD COLUMN     "rw_subscription_url" TEXT DEFAULT '',
ADD COLUMN     "rw_username" TEXT;
