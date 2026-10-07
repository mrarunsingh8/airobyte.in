import type { CollectionQueryGroup, ContentNavigationItem } from '@nuxt/content'

function findNode(items: ContentNavigationItem[] = [], path: string): ContentNavigationItem | undefined {
  for (const item of items) {
    if (item.path === path) return item
    const hit = findNode(item.children, path)
    if (hit) return hit
  }
}

/**
 * Query group that restricts a `learn` query to a single course:
 * `path = /learn/<course>` OR `path LIKE /learn/<course>/%`.
 * Use it with `.orWhere(inCourse(base))`. The trailing slash keeps
 * `/learn/java` from matching `/learn/javascript`.
 */
export const inCourse = (base: string) =>
  <T>(group: CollectionQueryGroup<T>) =>
    group.where('path', '=', base).where('path', 'LIKE', `${base}/%`)

/**
 * The current course, derived from the URL (`/learn/<course>/<lesson>`).
 * Layout and page share one fetch through the reactive key.
 */
export function useCourse() {
  const route = useRoute()

  const slug = computed(() => {
    const param = route.params.course
    return typeof param === 'string' ? param : (route.path.split('/').filter(Boolean)[1] ?? '')
  })

  const basePath = computed(() => `/learn/${slug.value}`)

  const ready = useAsyncData(
    () => `course-nav:${slug.value}`,
    () => queryCollectionNavigation('learn', ['description', 'actionBar']).orWhere(inCourse(basePath.value))
  )

  const courseNode = computed(() => findNode(ready.data.value ?? [], basePath.value))
  /** Tree with real content paths (/learn/<course>/<section>/<lesson>): use for lookups */
  const contentNavigation = computed(() => courseNode.value?.children ?? [])
  /** Same tree with public URLs (/learn/<course>/<lesson>): use for rendering links */
  const navigation = computed(() => toPublicNavigation(contentNavigation.value))
  const title = computed(() => courseNode.value?.title ?? slug.value)

  return { slug, basePath, navigation, contentNavigation, courseNode, title, ready }
}
