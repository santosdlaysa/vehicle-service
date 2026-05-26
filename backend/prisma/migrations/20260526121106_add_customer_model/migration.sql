-- AlterEnum
ALTER TYPE "ServiceStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_created_by_fkey";

-- DropForeignKey
ALTER TABLE "status_history" DROP CONSTRAINT "status_history_changed_by_fkey";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "preferred_date" TIMESTAMP(3),
ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "status_history" ALTER COLUMN "changed_by" DROP NOT NULL;

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
