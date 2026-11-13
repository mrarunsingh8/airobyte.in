import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

const site = {
  name: 'AiroByte',
  url: 'https://www.airobyte.in',
  locale: 'en_IN'
}

type SeoInput = {
  title?: MaybeRefOrGetter<string | null | undefined>
  description?: MaybeRefOrGetter<string | null | undefined>
  robots?: 'index, follow' | 'noindex, nofollow'
  type?: 'website' | 'article' | 'profile'
}

function cleanPath(path: string) {
  const value = path.split(/[?#]/)[0] || '/'
  return value === '/' ? '/' : value.replace(/\/$/, '')
}

function absolute(path: string) {
  return path === '/' ? `${site.url}/` : `${site.url}${path}`
}

/** Framework-native page metadata, canonical URL, social metadata, and JSON-LD. */
export function usePageSeo(path: MaybeRefOrGetter<string> = useRoute().path, input: SeoInput = {}) {
  const routePath = computed(() => cleanPath(toValue(path)))
  const title = computed(() => toValue(input.title) || 'Learn Programming with AiroByte')
  const description = computed(() => toValue(input.description) || 'Learn programming with practical, beginner-friendly lessons and a clear learning roadmap from AiroByte.')
  const canonical = computed(() => absolute(routePath.value))
  const type = input.type || 'website'
  const article = type === 'article'
  const schema = computed(() => article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title.value,
        description: description.value,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.value },
        publisher: { '@type': 'Organization', name: site.name, url: `${site.url}/` }
      }
    : {
        '@context': 'https://schema.org',
        '@type': routePath.value === '/' ? 'WebSite' : 'WebPage',
        name: title.value,
        description: description.value,
        url: canonical.value
      })

  useSeoMeta({
    title,
    description,
    robots: input.robots || 'index, follow',
    ogTitle: title,
    ogDescription: description,
    ogType: type,
    ogUrl: canonical,
    ogLocale: site.locale,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description
  })
  useHead({
    link: [{ key: 'canonical', rel: 'canonical', href: canonical }],
    script: computed(() => [{
      key: 'seo-jsonld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schema.value)
    }])
  })
  defineOgImage('Airobyte', { title, description })

  return { canonical, title, description }
}
