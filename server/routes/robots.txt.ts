export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return 'User-agent: *\nAllow: /\nDisallow: /playground\n\nSitemap: https://www.airobyte.in/sitemap.xml\n'
})
