// https://nuxt.com/docs/api/configuration/nuxt-config
import { toPublicPath } from './app/utils/coursePath'

// Lessons are served at /learn/<course>/<lesson> (section folders are dropped),
// so two files with the same name in one course would share a URL. Warn about it.
const learnUrls = new Map<string, string>()

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@nuxt/content', 'nuxt-og-image'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 3
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  hooks: {
    'content:file:afterParse'({ file, content, collection }) {
      const path = content.path
      if (collection.name !== 'learn' || typeof path !== 'string' || path.endsWith('/.navigation')) return

      const url = toPublicPath(path)
      const source = `content/${file.id.split('/').slice(1).join('/')}` // file.id = "<collection>/<relative path>"
      const owner = learnUrls.get(url)
      if (owner && owner !== source) {
        console.warn(`[learn] "${source}" and "${owner}" are both served at ${url}. Rename one of them.`)
      } else {
        learnUrls.set(url, source)
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
