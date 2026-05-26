-- AlterTable: remove odometer_photo_url from checklists
ALTER TABLE "checklists" DROP COLUMN IF EXISTS "odometer_photo_url";

-- CreateTable: checklist_photos
CREATE TABLE IF NOT EXISTS "checklist_photos" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "checklist_photos" ADD CONSTRAINT "checklist_photos_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
