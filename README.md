This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

Requiere Node 26 (LTS) y pnpm 12 (`npm install -g pnpm@12.18.0`; Node 25+ ya no trae corepack).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# libling-web
website for Libling solutions, that works as landing page and base for a web app too


## Tests

Los tests funcionales necesitan una base PostgreSQL con las migraciones aplicadas (`pnpm exec prisma migrate deploy`).

```bash
export POSTGRES_PRISMA_URL=postgresql://user:pass@localhost:5432/libling_test
export POSTGRES_URL_NON_POOLING=$POSTGRES_PRISMA_URL
pnpm test            # vitest: helpers de edición + updateProperty contra la BD real
AUTH_SECRET=test AUTH_TRUST_HOST=true pnpm test:e2e   # Playwright: editar una propiedad desde el admin
```

Los tests crean sus propios datos y los eliminan al terminar; usa una BD de pruebas, no la de producción.


## Dependencias y seguridad

- Gestor: pnpm. Los scripts de instalacion estan bloqueados salvo los de Prisma (`allowBuilds` en `pnpm-workspace.yaml`) y no se instalan versiones publicadas hace menos de 24 h (`minimumReleaseAge`).
- Auditoria: `pnpm audit` y `osv-scanner scan source --lockfile pnpm-lock.yaml`.


## Configuracion (variables de entorno)

Todas las variables estan en `.env.example`, con una linea que explica para que sirve cada una y si es obligatoria. Copialo a `.env` para trabajar en local; en Dokploy se cargan en la pestaña de variables del servicio.

## Papelera y tareas diarias

- Borrar un inmueble o una foto en el admin los mueve a la **Papelera** (menu lateral): se ocultan del sitio pero se pueden restaurar (un inmueble vuelve como borrador).
- `POST /api/cron/maintenance` (cabecera `Authorization: Bearer $CRON_SECRET`) debe ejecutarse **una vez al dia** (Dokploy > Schedules). Elimina del todo lo que lleva mas de 90 dias en la papelera, incluidos sus archivos del bucket, y convierte a WebP un lote de fotos antiguas.
- En el contenedor desplegado NO existen `pnpm` ni los scripts (la imagen solo lleva el servidor). Para convertir de golpe todas las fotos antiguas, desde la consola del contenedor (necesita `CRON_SECRET` definido):
  ```bash
  node -e '(async()=>{for(;;){const r=await fetch("http://127.0.0.1:3000/api/cron/maintenance",{method:"POST",headers:{authorization:"Bearer "+process.env.CRON_SECRET}});const j=await r.json();console.log(JSON.stringify(j.convert));if(j.convert==null||j.convert.remaining<=0||j.convert.done===0)break}})()'
  ```
  Repite lotes de 25 hasta que `remaining` sea 0 (o hasta que un lote no convierta nada). Es seguro repetirlo.
- En local, `pnpm convert-images` hace lo mismo con el script; `pnpm optimize-assets` optimiza las imagenes y videos estaticos de `public/`.
