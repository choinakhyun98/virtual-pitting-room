import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://my-fitting-room.vercel.app',
      lastModified: new Date(),
    },
  ]
}