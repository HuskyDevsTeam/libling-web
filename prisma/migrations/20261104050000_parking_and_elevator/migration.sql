-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "parking" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "elevator" BOOLEAN NOT NULL DEFAULT false;
