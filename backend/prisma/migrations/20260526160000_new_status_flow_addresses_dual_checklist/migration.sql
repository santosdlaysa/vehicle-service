-- CreateEnum: ChecklistType
CREATE TYPE "ChecklistType" AS ENUM ('PICKUP', 'DELIVERY');

-- 1. Convert enum columns to TEXT first (avoids PostgreSQL "new enum value must be committed" error)
ALTER TABLE "services" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "status" TYPE TEXT;
ALTER TABLE "status_history" ALTER COLUMN "old_status" TYPE TEXT;
ALTER TABLE "status_history" ALTER COLUMN "new_status" TYPE TEXT;

-- Drop old enum
DROP TYPE "ServiceStatus";

-- 2. Migrate existing data to new status values (now operating on TEXT columns)
UPDATE "services" SET "status" = 'AGUARDANDO_COLETA' WHERE "status" = 'PENDING';
UPDATE "services" SET "status" = 'AGUARDANDO_COLETA' WHERE "status" = 'RECEIVED';
UPDATE "services" SET "status" = 'EM_TRANSITO_PARA_ESTETICA' WHERE "status" = 'IN_PROGRESS';
UPDATE "services" SET "status" = 'EM_LAVAGEM_SERVICO' WHERE "status" = 'FINISHED';
UPDATE "services" SET "status" = 'PRONTO_PARA_DEVOLUCAO' WHERE "status" = 'READY';
UPDATE "services" SET "status" = 'ENTREGUE_CONCLUIDO' WHERE "status" = 'DELIVERED';
UPDATE "services" SET "status" = 'ENTREGUE_CONCLUIDO' WHERE "status" = 'CLOSED';

UPDATE "status_history" SET "old_status" = 'AGUARDANDO_COLETA' WHERE "old_status" = 'PENDING';
UPDATE "status_history" SET "old_status" = 'AGUARDANDO_COLETA' WHERE "old_status" = 'RECEIVED';
UPDATE "status_history" SET "old_status" = 'EM_TRANSITO_PARA_ESTETICA' WHERE "old_status" = 'IN_PROGRESS';
UPDATE "status_history" SET "old_status" = 'EM_LAVAGEM_SERVICO' WHERE "old_status" = 'FINISHED';
UPDATE "status_history" SET "old_status" = 'PRONTO_PARA_DEVOLUCAO' WHERE "old_status" = 'READY';
UPDATE "status_history" SET "old_status" = 'ENTREGUE_CONCLUIDO' WHERE "old_status" = 'DELIVERED';
UPDATE "status_history" SET "old_status" = 'ENTREGUE_CONCLUIDO' WHERE "old_status" = 'CLOSED';

UPDATE "status_history" SET "new_status" = 'AGUARDANDO_COLETA' WHERE "new_status" = 'PENDING';
UPDATE "status_history" SET "new_status" = 'AGUARDANDO_COLETA' WHERE "new_status" = 'RECEIVED';
UPDATE "status_history" SET "new_status" = 'EM_TRANSITO_PARA_ESTETICA' WHERE "new_status" = 'IN_PROGRESS';
UPDATE "status_history" SET "new_status" = 'EM_LAVAGEM_SERVICO' WHERE "new_status" = 'FINISHED';
UPDATE "status_history" SET "new_status" = 'PRONTO_PARA_DEVOLUCAO' WHERE "new_status" = 'READY';
UPDATE "status_history" SET "new_status" = 'ENTREGUE_CONCLUIDO' WHERE "new_status" = 'DELIVERED';
UPDATE "status_history" SET "new_status" = 'ENTREGUE_CONCLUIDO' WHERE "new_status" = 'CLOSED';

CREATE TYPE "ServiceStatus" AS ENUM (
  'AGUARDANDO_COLETA',
  'EM_TRANSITO_PARA_ESTETICA',
  'RECEBIDO_NA_ESTETICA',
  'EM_LAVAGEM_SERVICO',
  'PRONTO_PARA_DEVOLUCAO',
  'EM_TRANSITO_PARA_ENTREGA',
  'ENTREGUE_CONCLUIDO'
);

ALTER TABLE "services" ALTER COLUMN "status" TYPE "ServiceStatus" USING "status"::"ServiceStatus";
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'AGUARDANDO_COLETA';
ALTER TABLE "status_history" ALTER COLUMN "old_status" TYPE "ServiceStatus" USING "old_status"::"ServiceStatus";
ALTER TABLE "status_history" ALTER COLUMN "new_status" TYPE "ServiceStatus" USING "new_status"::"ServiceStatus";

-- 4. Add new columns to services table (RF-011, RF-013)
ALTER TABLE "services" ADD COLUMN "pickup_address" TEXT;
ALTER TABLE "services" ADD COLUMN "delivery_address" TEXT;
ALTER TABLE "services" ADD COLUMN "driver_name" TEXT;

-- 5. Modify checklists table for dual checklist (RF-012) and odometer (RN-005)
-- Drop the old unique constraint on service_id
ALTER TABLE "checklists" DROP CONSTRAINT IF EXISTS "checklists_service_id_key";

-- Add new columns
ALTER TABLE "checklists" ADD COLUMN "type" "ChecklistType" NOT NULL DEFAULT 'PICKUP';
ALTER TABLE "checklists" ADD COLUMN "odometer" INTEGER;
ALTER TABLE "checklists" ADD COLUMN "odometer_photo_url" TEXT;

-- Add new composite unique constraint
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_service_id_type_key" UNIQUE ("service_id", "type");
