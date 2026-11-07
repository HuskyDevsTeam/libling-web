-- Borrado logico de inmuebles e imagenes (purga a los 90 dias)
ALTER TABLE "Property" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "PropertyImage" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Property_deletedAt_idx" ON "Property"("deletedAt");
CREATE INDEX "PropertyImage_deletedAt_idx" ON "PropertyImage"("deletedAt");
