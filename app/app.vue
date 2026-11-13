<script setup lang="ts">
useHead({
  script: [
    {
      key: 'gtm',
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T237PDRM');`
    }
  ],
  noscript: [
    {
      tagPosition: 'bodyOpen',
      innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T237PDRM" height="0" width="0" style="display:none;visibility:hidden"></iframe>'
    }
  ]
})
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
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#00b8db' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/svg+xml', href: '/logos/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/logos/apple-touch-icon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: '%s | AiroByte',
  ogSiteName: 'AiroByte',
  ogLocale: 'en_IN',
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
      <LazyUContentSearch :files="files" :navigation="searchNavigation" />
    </ClientOnly>
  </UApp>
</template>
