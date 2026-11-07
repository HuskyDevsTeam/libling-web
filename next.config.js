// Host del que se cargan las imagenes (S3 hoy, R2 despues). Se lee en BUILD:
// en Dokploy definirlo tambien como build arg si se cambia.
const imageHost = process.env.IMAGE_HOST || 'libling-assets.s3.eu-west-2.amazonaws.com'

const isDev = process.env.NODE_ENV !== 'production'

// Politica de contenido: solo se permite cargar desde el propio sitio y los servicios que usa la web
// (Google Analytics, MapTiler y el host de imagenes). 'unsafe-inline' hace falta por los scripts en linea
// de Next y de Google Analytics; el resto de directivas cierran las vias mas comunes de XSS e inyeccion.
const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://${imageHost} https://api.maptiler.com https://*.google-analytics.com https://*.googletagmanager.com`,
    "font-src 'self' data:",
    `connect-src 'self' https://api.maptiler.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com${isDev ? " ws: wss:" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].filter(Boolean).join('; ')

const securityHeaders = [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    async headers() {
        return [
            { source: '/:path*', headers: securityHeaders },
            // El enlace de restablecer contrasena lleva el token en la URL: no debe salir en el Referer.
            // Solo en esa pagina: el login necesita el Referer para volver al panel despues de entrar.
            { source: '/:lang/auth/change-password', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
        ]
    },
    images:{
        unoptimized: false,
        remotePatterns: [
            {
              protocol: 'https',
              hostname: imageHost,
              port: '',
            },
          ],
    }
}


module.exports = nextConfig
