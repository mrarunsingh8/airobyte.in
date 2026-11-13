import { queryCollection } from '@nuxt/content/server'
import { toPublicPath } from '~/utils/coursePath'

const siteUrl = 'https://www.airobyte.in'

export default defineEventHandler(async (event) => {
  const lessons = await queryCollection(event as never, 'learn')
    .where('path', 'NOT LIKE', '%/.navigation')
    .select('path')
    .all()
  const urls = [...new Set(['/', '/about', '/learn', ...lessons.map(page => toPublicPath(page.path))])].sort()
  const rows = urls.map(path => `  <url><loc>${path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`}</loc></url>`).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`
})
