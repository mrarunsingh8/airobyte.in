<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { navigation, title, basePath, slug } = useCourse()
const { isCompleted, isFavourite } = useProgress()
const route = useRoute()

/** Count lessons (leaves) and completed lessons under a group */
function tally(items: ContentNavigationItem[] = []): { done: number, total: number } {
  return items.reduce((acc, item) => {
    if (item.children?.length) {
      const sub = tally(item.children)
      return { done: acc.done + sub.done, total: acc.total + sub.total }
    }
    // Pages without the action bar can't be marked complete, so they don't count
    if (item.page === false || item.actionBar === false) return acc
    return { done: acc.done + (isCompleted(item.path) ? 1 : 0), total: acc.total + 1 }
  }, { done: 0, total: 0 })
}

/**
 * Same sidebar tree, decorated with progress:
 * - completed lessons: check icon instead of their own, title in green
 * - favourite lessons: amber star on the right
 * - modules show "done/total" once started, green when finished
 */
function withProgress(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => {
    if (item.children?.length) {
      const { done, total } = tally(item.children)
      return {
        ...item,
        children: withProgress(item.children),
        ...(done > 0 && {
          badge: {
            label: done === total ? `${total}/${total}` : `${done}/${total}`,
            color: done === total ? 'success' : 'neutral',
            variant: 'subtle',
            size: 'sm'
          }
        })
      }
    }
    const completed = isCompleted(item.path)
    const favourite = isFavourite(item.path)
    if (!completed && !favourite) return item

    return {
      ...item,
      // Completed: the lesson's own icon becomes a check, and the whole row turns green
      ...(completed && { icon: 'i-lucide-circle-check-big' }),
      // Favourite: an amber star on the right
      ...(favourite && { trailingIcon: 'i-custom-star-filled' }),
      ui: {
        ...(item.ui as object),
        ...(completed && {
          link: 'text-success hover:text-success data-[state=open]:text-success',
          linkLeadingIcon: 'text-success group-hover:text-success'
        }),
        ...(favourite && { linkTrailingIcon: 'text-amber-500 size-4' })
      }
    }
  })
}

const progressNavigation = computed(() => withProgress(navigation.value))

/** Path of the top-level module that contains the current lesson */
function contains(item: ContentNavigationItem, path: string): boolean {
  return item.path === path || !!item.children?.some(child => contains(child, path))
}
const currentPath = computed(() => route.path.replace(/\/$/, ''))

/** Current lesson in the sidebar tree; `actionBar: false` in its frontmatter hides the action bar */
function findItem(items: ContentNavigationItem[], path: string): ContentNavigationItem | undefined {
  for (const item of items) {
    if (item.path === path) return item
    const hit = findItem(item.children ?? [], path)
    if (hit) return hit
  }
}
const showActionBar = computed(() => findItem(navigation.value, currentPath.value)?.actionBar !== false)
const openModule = computed(() => navigation.value.find(item => contains(item, currentPath.value))?.path ?? '')

// Whole-course progress for the sidebar header
const courseTally = computed(() => tally(navigation.value))
const coursePercent = computed(() => courseTally.value.total ? Math.round((courseTally.value.done / courseTally.value.total) * 100) : 0)
</script>

<template>
  <div>
    <AppHeader />
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <template #top>
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <NuxtLink
                    :to="basePath"
                    class="truncate font-semibold text-highlighted"
                  >
                    {{ title }}
                  </NuxtLink>
                  <span
                    class="shrink-0 text-sm font-medium tabular-nums"
                    :class="coursePercent === 100 ? 'text-success' : 'text-muted'"
                  >
                    {{ coursePercent }}%
                  </span>
                </div>
                <UProgress
                  :model-value="coursePercent"
                  size="xs"
                  :color="coursePercent === 100 ? 'success' : 'primary'"
                  :aria-label="`${coursePercent}% of ${title} completed`"
                />
                <p class="text-xs text-muted">
                  {{ courseTally.done }} of {{ courseTally.total }} lessons completed
                </p>
              </div>
            </template>

            <!-- Only the current lesson's module is open. The key re-applies that
                 when you move into another module; within a module, anything you
                 opened yourself stays open. -->
            <UContentNavigation
              :key="openModule"
              highlight
              default-open
              :navigation="progressNavigation"
            />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </UContainer>
    <LessonActionBar
      v-if="showActionBar"
      :navigation="progressNavigation"
      :course-id="slug"
    />
    <AppFooter />
  </div>
</template>
