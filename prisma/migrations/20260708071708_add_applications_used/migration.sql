-- AlterTable
ALTER TABLE "users" ADD COLUMN     "applicationsUsed" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing users with their current number of applications
UPDATE "users" SET "applicationsUsed" = (
  SELECT COUNT(*) FROM "applications" WHERE "applications"."userId" = "users"."id"
);
