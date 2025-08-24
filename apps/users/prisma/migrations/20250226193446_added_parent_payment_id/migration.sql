-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "parent_payment_id" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_parent_payment_id_fkey" FOREIGN KEY ("parent_payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
