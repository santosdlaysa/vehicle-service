-- AlterTable: add reset token fields to customers
ALTER TABLE "customers" ADD COLUMN "reset_token" TEXT;
ALTER TABLE "customers" ADD COLUMN "reset_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "customers_reset_token_key" ON "customers"("reset_token");
