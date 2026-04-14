-- CreateTable
CREATE TABLE "audit_message_deliveries" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "success" BOOLEAN NOT NULL,
    "error" TEXT,

    CONSTRAINT "audit_message_deliveries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_message_deliveries" ADD CONSTRAINT "audit_message_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
