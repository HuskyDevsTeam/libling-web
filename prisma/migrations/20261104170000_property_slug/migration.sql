-- AlterTable: slug semántico para las URLs de detalle (SEO)
ALTER TABLE "Property" ADD COLUMN "slug" TEXT;

-- Backfill: slug a partir del título (sin acentos, minúsculas, guiones).
-- Si dos propiedades generan el mismo slug, las siguientes (por id) añaden "-<id>".
WITH base AS (
  SELECT
    "id",
    COALESCE(NULLIF(
      trim(both '-' from left(
        regexp_replace(
          lower(translate("title",
            'ÁÀÂÄÃÅáàâäãåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÖÕóòôöõÚÙÛÜúùûüÇçÑñ',
            'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')),
          '[^a-z0-9]+', '-', 'g'),
        80)),
      ''), 'propiedad') AS s
  FROM "Property"
), ranked AS (
  SELECT "id", s, row_number() OVER (PARTITION BY s ORDER BY "id") AS rn FROM base
)
UPDATE "Property" p
SET "slug" = CASE WHEN r.rn = 1 THEN r.s ELSE r.s || '-' || p."id" END
FROM ranked r WHERE r."id" = p."id";

ALTER TABLE "Property" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
