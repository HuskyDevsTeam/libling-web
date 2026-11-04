import { MetadataRoute } from 'next'

// Leer las variables en cada peticion, no en el build
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.APP_URL || 'https://libling.lu'

export default function robots(): MetadataRoute.Robots {
  // Staging must never be indexed
  if (process.env.APP_ENV === 'staging') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
