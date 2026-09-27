<script setup lang="ts">
const { seo } = useAppConfig()

// Site-wide search across all courses (results are grouped by course).
// The sidebar navigation is per course: see useCourse() in layouts/docs.vue.
// Paths are converted to public URLs (/learn/<course>/<lesson>), see utils/coursePath.ts.
const { data: searchNavigation } = useLazyAsyncData('search-navigation', () => queryCollectionNavigation('learn'), {
  server: false,
  transform: toPublicNavigation
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('learn'), {
  server: false,
  transform: sections => sections.map(section => ({ ...section, id: toPublicPath(section.id) }))
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="searchNavigation"
      />
    </ClientOnly>
  </UApp>
</template>
