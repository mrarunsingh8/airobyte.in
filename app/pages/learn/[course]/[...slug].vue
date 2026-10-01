<script setup lang="ts">
import { findPageHeadline } from '@nuxt/content/utils'
import { withoutTrailingSlash } from 'ufo'

definePageMeta({
  layout: 'learn'
})

const route = useRoute()
const { toc } = useAppConfig()
const path = computed(() => withoutTrailingSlash(route.path))
const segments = computed(() => [route.params.slug ?? []].flat().filter(Boolean))
const { basePath, contentNavigation, title: courseTitle, ready } = useCourse()

// Public URLs are /learn/<course>/<lesson>; content paths keep section folders
// (/learn/<course>/<section>/<lesson>), so a flat URL is resolved by its last segment.
const { data: page } = await useAsyncData(() => `page:${path.value}`, async () => {
  const base = basePath.value

  // Course root, or an old nested URL (redirected to its flat form below)
  if (segments.value.length !== 1) {
    return queryCollection('learn').path(path.value).first()
  }

  const slug = segments.value[0]
  const matches = await queryCollection('learn')
    .orWhere(group => group
      .where('path', '=', `${base}/${slug}`)
      .where('path', 'LIKE', `${base}/%/${slug}`))
    .where('path', 'NOT LIKE', '%/.navigation')
    .order('stem', 'ASC')
    .all()

  if (import.meta.dev && matches.length > 1) {
    console.warn(`[learn] ${path.value} matches several pages, showing the first one. Rename one of:`, matches.map(m => m.stem))
  }

  return matches[0] ?? null
})

await ready

if (!page.value) {
  // Course root without an index.md → send to the first lesson instead of a 404
  const first = path.value === basePath.value
    ? await queryCollection('learn')
        .where('path', 'LIKE', `${basePath.value}/%`)
        .where('extension', '=', 'md')
        .order('stem', 'ASC')
        .select('path')
        .first()
    : null

  if (first) {
    await navigateTo(toPublicPath(first.path), { redirectCode: 302 })
  } else {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
} else if (toPublicPath(page.value.path) !== path.value) {
  // Old nested URL (/learn/<course>/<section>/<lesson>) → permanent redirect to the flat URL
  await navigateTo(toPublicPath(page.value.path), { redirectCode: 301 })
}

// Prev/Next restricted to the current course
const { data: rawSurround } = await useAsyncData(
  () => `surround:${path.value}`,
  () => page.value
    ? queryCollectionItemSurroundings('learn', page.value.path, { fields: ['description'] })
        .orWhere(inCourse(basePath.value))
    : Promise.resolve([])
)
const surround = computed(() => rawSurround.value?.map(item => item && { ...item, path: toPublicPath(item.path) }))

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const headline = computed(() => findPageHeadline(contentNavigation.value, page.value?.path))

defineOgImage('Docs', { title, description, headline: headline.value })

/* const breadcrumb = computed(() => {
  const items = [
    { label: 'Learn', to: '/learn' },
    { label: courseTitle.value, to: basePath.value },
    // Breadcrumbs are matched on content paths, then converted to public URLs
    ...findPageBreadcrumb(contentNavigation.value, page.value?.path, { current: true, indexAsChild: true })
      // Section folders without an index page are shown as plain text, not dead links
      .map(item => ({ label: item.title, to: item.page === false ? undefined : toPublicPath(item.path), key: item.path }))
  ].map(item => ({ key: item.to, ...item }))
  // The course root can appear twice (course node + its index page)
  return items
    .filter((item, index) => items.findIndex(other => other.key === item.key) === index)
    .map(({ key: _key, ...item }) => item)
}) */

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})
</script>

<template>
  <UPage v-if="page">
    <!-- <UPageHeader
      :title="page.title"
      :description="page.description"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>

      <template #links>
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />
      </template>
    </UPageHeader> -->

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      />
    </template>
  </UPage>
</template>
