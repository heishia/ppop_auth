-- AlterTable
ALTER TABLE "users" ADD COLUMN "is_global_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "users_is_global_admin_idx" ON "users"("is_global_admin");

