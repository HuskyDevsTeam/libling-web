// Host del que se cargan las imagenes (S3 hoy, R2 despues). Se lee en BUILD:
// en Dokploy definirlo tambien como build arg si se cambia.
const imageHost = process.env.IMAGE_HOST || 'libling-assets.s3.eu-west-2.amazonaws.com'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
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
