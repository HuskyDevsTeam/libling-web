#!/bin/sh
set -e
# Con RUN_MIGRATIONS=true aplica las migraciones pendientes antes de arrancar (idempotente).
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Aplicando migraciones de Prisma..."
  node node_modules/prisma/build/index.js migrate deploy
fi
exec node server.js
