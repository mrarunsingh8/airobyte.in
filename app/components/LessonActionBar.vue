<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { withoutTrailingSlash } from 'ufo'

/** The course sidebar tree with public URLs (from useCourse().navigation) */
const props = defineProps<{
  navigation: ContentNavigationItem[]
  courseId: string
}>()

const route = useRoute()
const toast = useToast()
const chaptersOpen = ref(false)
const { isCompleted, isFavourite, setCompleted, setFavourite, forCourse, loaded } = useProgress()

// Every lesson in reading order (folders without a page are only groups)
function flatten(items: ContentNavigationItem[] = []): ContentNavigationItem[] {
  return items.flatMap(item => item.children?.length ? flatten(item.children) : (item.page === false ? [] : [item]))
}

const lessons = computed(() => flatten(props.navigation))
const lessonId = computed(() => withoutTrailingSlash(route.path))
const index = computed(() => lessons.value.findIndex(lesson => lesson.path === lessonId.value))
const prev = computed(() => index.value > 0 ? lessons.value[index.value - 1] : undefined)
const next = computed(() => index.value >= 0 ? lessons.value[index.value + 1] : undefined)

const completed = computed(() => isCompleted(lessonId.value))
const favourite = computed(() => isFavourite(lessonId.value))

// Pages with `actionBar: false` can't be marked complete, so progress ignores them
const trackedLessons = computed(() => lessons.value.filter(lesson => (lesson.actionBar !== false)))
const currentLessonActionBar = computed(() => lessons.value[index.value]?.actionBar)
const actionBarOptions = computed(() => {
  const actionBar = currentLessonActionBar.value
  return actionBar && typeof actionBar === 'object' && !Array.isArray(actionBar)
    ? actionBar as { favourite?: boolean, completed?: boolean }
    : undefined
})
const isActionBarFavorite = computed(() => currentLessonActionBar.value !== false && actionBarOptions.value?.favourite !== false)
const isActionBarCompleted = computed(() => currentLessonActionBar.value !== false && actionBarOptions.value?.completed !== false)

const lessonPaths = computed(() => new Set(trackedLessons.value.map(lesson => lesson.path)))
const doneCount = computed(() => forCourse(props.courseId).filter(entry => entry.completed && lessonPaths.value.has(entry.lessonId)).length)
const percent = computed(() => trackedLessons.value.length ? Math.round((doneCount.value / trackedLessons.value.length) * 100) : 0)

async function toggleCompleted() {
  const value = !completed.value
  try {
    await setCompleted(lessonId.value, value)
    if (value) {
      toast.add({
        title: 'Lesson completed',
        description: next.value ? `Up next: ${next.value.title}` : 'You\'ve finished the last lesson of this course.',
        icon: 'i-lucide-circle-check',
        color: 'success',
        actions: next.value ? [{ label: 'Next lesson', to: next.value.path, trailingIcon: 'i-lucide-arrow-right' }] : undefined
      })
    }
  } catch {
    toast.add({ title: 'Could not save your progress', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

async function toggleFavourite() {
  const value = !favourite.value
  try {
    await setFavourite(lessonId.value, value)
    toast.add({ title: value ? 'Added to favourites' : 'Removed from favourites', icon: value ? 'i-custom-star-filled' : 'i-lucide-star-off' })
  } catch {
    toast.add({ title: 'Could not save your favourite', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

watch(() => route.path, () => {
  chaptersOpen.value = false
})

// Keyboard: ← / → to move between lessons (ignored while typing in the playground)
defineShortcuts({
  arrowleft: () => prev.value && navigateTo(prev.value.path),
  arrowright: () => next.value && navigateTo(next.value.path)
})
</script>

<template>
  <div
    v-if="index >= 0"
    class="sticky bottom-0 z-40 border-t border-default bg-default/85 backdrop-blur supports-[backdrop-filter]:bg-default/70"
  >
    <!-- Course progress along the top edge -->
    <UProgress
      :model-value="percent"
      size="2xs"
      class="absolute inset-x-0 -top-px"
      :ui="{ base: 'bg-transparent rounded-none', indicator: 'rounded-none' }"
    />

    <UContainer class="flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
      <!-- Left: chapters (mobile) + previous -->
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <USlideover v-model:open="chaptersOpen" side="left" title="Chapters" class="lg:hidden">
          <UButton
            icon="i-lucide-panel-left"
            color="neutral"
            variant="ghost"
            aria-label="Open chapters"
            class="lg:hidden"
          />
          <template #body>
            <UContentNavigation highlight default-open :navigation="navigation" />
          </template>
        </USlideover>

        <UTooltip v-if="prev" :text="prev.title" :kbds="['arrowleft']">
          <UButton
            :to="prev.path"
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="outline"
            :aria-label="`Previous lesson: ${prev.title}`"
            class="min-w-0"
            :ui="{ label: 'hidden xl:block truncate max-w-48' }"
            :label="prev.title"
          />
        </UTooltip>
      </div>

      <!-- Centre: lesson actions -->
      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <UButton
          v-if="isActionBarFavorite"
          :icon="favourite ? 'i-custom-star-filled' : 'i-lucide-star'"
          :color="favourite ? 'warning' : 'neutral'"
          :variant="favourite ? 'soft' : 'ghost'"
          :aria-pressed="favourite"
          :aria-label="favourite ? 'Remove from favourites' : 'Add to favourites'"
          :disabled="!loaded"
          label="Favourite"
          :ui="{ label: 'hidden sm:block' }"
          @click="toggleFavourite"
        />

        <UButton
          v-if="isActionBarCompleted"
          :icon="completed ? 'i-lucide-circle-check-big' : 'i-lucide-circle-check'"
          :color="completed ? 'success' : 'primary'"
          :variant="completed ? 'soft' : 'solid'"
          :aria-pressed="completed"
          :loading="!loaded"
          :label="completed ? 'Completed' : 'Mark as complete'"
          :ui="{ label: 'hidden sm:block' }"
          @click="toggleCompleted"
        />

        <UBadge
          :label="`${doneCount}/${trackedLessons.length}`"
          color="neutral"
          variant="subtle"
          class="hidden font-mono md:inline-flex"
          :title="`${percent}% of this course completed`"
        />
      </div>

      <!-- Right: next -->
      <div class="flex min-w-0 flex-1 justify-end">
        <UTooltip v-if="next" :text="next.title" :kbds="['arrowright']">
          <UButton
            :to="next.path"
            trailing-icon="i-lucide-chevron-right"
            :color="completed ? 'primary' : 'neutral'"
            :variant="completed ? 'solid' : 'outline'"
            :aria-label="`Next lesson: ${next.title}`"
            class="min-w-0"
            :ui="{ label: 'hidden xl:block truncate max-w-48' }"
            :label="next.title"
          />
        </UTooltip>
      </div>
    </UContainer>
  </div>
</template>
