-- AlterTable
ALTER TABLE "users" ALTER COLUMN "telegram_username" DROP NOT NULL,
ALTER COLUMN "desktop_os" DROP NOT NULL,
ALTER COLUMN "device_os" DROP NOT NULL;
