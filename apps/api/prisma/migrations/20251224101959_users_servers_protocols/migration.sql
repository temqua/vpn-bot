
-- AlterTable
ALTER TABLE "users" DROP COLUMN "protocols";

-- AlterEnum
BEGIN;
DROP TYPE "vpn_protocol";
CREATE TYPE "vpn_protocol" AS ENUM ('WireGuard', 'IKEv2', 'OpenVPN');
COMMIT;

-- CreateTable
CREATE TABLE "vpn_servers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "vpn_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servers_users" (
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    "protocol" "vpn_protocol" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servers_users_pkey" PRIMARY KEY ("userId","serverId","protocol")
);

-- AddForeignKey
ALTER TABLE "servers_users" ADD CONSTRAINT "servers_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servers_users" ADD CONSTRAINT "servers_users_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "vpn_servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
